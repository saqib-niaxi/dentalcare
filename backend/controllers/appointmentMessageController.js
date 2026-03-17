const Message = require('../models/Message');
const Appointment = require('../models/Appointment');

// GET /api/appointments/:id/messages
const getMessages = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Patients can only view their own appointment messages
    if (req.user.role !== 'admin' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ appointment: req.params.id, type: 'appointment' })
      .sort({ createdAt: 1 })
      .populate('sender', 'name');

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/appointments/:id/messages
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Patients can only message their own appointments
    if (req.user.role !== 'admin' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await Message.create({
      type: 'appointment',
      appointment: req.params.id,
      sender: req.user._id,
      senderRole: req.user.role === 'admin' ? 'admin' : 'patient',
      content: content.trim()
    });

    await message.populate('sender', 'name');

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/appointments/:id/messages/read
const markAsRead = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role !== 'admin' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark messages from the OTHER party as read
    const otherRole = req.user.role === 'admin' ? 'patient' : 'admin';
    await Message.updateMany(
      { appointment: req.params.id, type: 'appointment', senderRole: otherRole, isRead: false },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments/messages/unread-counts
const getUnreadCounts = async (req, res) => {
  try {
    const myRole = req.user.role === 'admin' ? 'admin' : 'patient';
    const otherRole = myRole === 'admin' ? 'patient' : 'admin';

    let matchStage = { type: 'appointment', senderRole: otherRole, isRead: false };

    // If patient, only count messages on their own appointments
    if (myRole === 'patient') {
      const myAppointments = await Appointment.find({ patient: req.user._id }).select('_id');
      const myAppointmentIds = myAppointments.map(a => a._id);
      matchStage.appointment = { $in: myAppointmentIds };
    }

    const counts = await Message.aggregate([
      { $match: matchStage },
      { $group: { _id: '$appointment', count: { $sum: 1 } } }
    ]);

    const unreadCounts = {};
    let total = 0;
    counts.forEach(c => {
      unreadCounts[c._id.toString()] = c.count;
      total += c.count;
    });

    res.json({ success: true, unreadCounts, total });
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMessages, sendMessage, markAsRead, getUnreadCounts };
