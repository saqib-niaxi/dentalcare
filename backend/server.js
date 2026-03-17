const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

const connectDB = require('./config/database');
const { startScheduler } = require('./scheduler');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Start appointment scheduler
startScheduler();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend folder (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  });
}

// Import routes
const appointmentRoutes = require('./routes/appointmentRoutes');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const contactRoutes = require('./routes/contactRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const liveChatRoutes = require('./routes/liveChatRoutes');
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/live-chat', liveChatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }
});

// Socket auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  // Join personal room
  socket.join(`user:${socket.user._id}`);

  // Admins join admin room
  if (socket.user.role === 'admin') {
    socket.join('admin');
  }

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('send_message', async ({ conversationId, content }) => {
    try {
      if (!content || !content.trim()) return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      // Auth check
      if (socket.user.role !== 'admin' && conversation.patient.toString() !== socket.user._id.toString()) return;

      const senderRole = socket.user.role === 'admin' ? 'admin' : 'patient';

      const message = await Message.create({
        type: 'live',
        conversation: conversationId,
        sender: socket.user._id,
        senderRole,
        content: content.trim()
      });

      await message.populate('sender', 'name');

      // Broadcast to conversation room
      io.to(`conversation:${conversationId}`).emit('new_message', {
        conversationId,
        message
      });

      // Notify the other party
      if (senderRole === 'patient') {
        io.to('admin').emit('conversation_updated', { conversationId });
      } else {
        io.to(`user:${conversation.patient}`).emit('conversation_updated', { conversationId });
      }
    } catch (err) {
      console.error('Socket send_message error:', err);
    }
  });

  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId: socket.user._id,
      name: socket.user.name,
      isTyping
    });
  });

  socket.on('mark_read', async ({ conversationId }) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const otherRole = socket.user.role === 'admin' ? 'patient' : 'admin';
      await Message.updateMany(
        { conversation: conversationId, type: 'live', senderRole: otherRole, isRead: false },
        { isRead: true }
      );

      socket.to(`conversation:${conversationId}`).emit('messages_read', { conversationId });
    } catch (err) {
      console.error('Socket mark_read error:', err);
    }
  });

  socket.on('disconnect', () => {
    // Cleanup handled automatically by Socket.io
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server, io };
