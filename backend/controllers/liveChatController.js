const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// GET /api/live-chat/conversations
const getConversations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.patient = req.user._id;
    }

    const conversations = await Conversation.find(query)
      .populate('patient', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/live-chat/conversations/:id
const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('patient', 'name email');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (req.user.role !== 'admin' && conversation.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.id, type: 'live' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name');

    const total = await Message.countDocuments({ conversation: req.params.id, type: 'live' });

    res.json({
      success: true,
      conversation,
      messages: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/live-chat/conversations
const createConversation = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(400).json({ message: 'Admins cannot create conversations' });
    }

    // Return existing active conversation if one exists
    let conversation = await Conversation.findOne({
      patient: req.user._id,
      status: 'active'
    }).populate('patient', 'name email');

    if (conversation) {
      return res.json({ success: true, conversation, existing: true });
    }

    conversation = await Conversation.create({ patient: req.user._id });
    conversation = await conversation.populate('patient', 'name email');

    res.status(201).json({ success: true, conversation, existing: false });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/live-chat/conversations/:id/close
const closeConversation = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can close conversations' });
    }

    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    ).populate('patient', 'name email');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Error closing conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/live-chat/unread
const getTotalUnread = async (req, res) => {
  try {
    let total = 0;
    if (req.user.role === 'admin') {
      // Count live messages sent by patients that are unread
      const result = await Message.aggregate([
        { $match: { type: 'live', isRead: false, senderRole: 'patient' } },
        { $count: 'total' }
      ]);
      total = result[0]?.total || 0;
    } else {
      // Count live messages sent by admin on this patient's conversations
      const myConversations = await Conversation.find({ patient: req.user._id }).select('_id');
      const myConversationIds = myConversations.map(c => c._id);
      const result = await Message.aggregate([
        { $match: { type: 'live', isRead: false, senderRole: 'admin', conversation: { $in: myConversationIds } } },
        { $count: 'total' }
      ]);
      total = result[0]?.total || 0;
    }

    res.json({ success: true, total });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/live-chat/conversations/:id
const deleteConversation = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete conversations' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await Message.deleteMany({ conversation: req.params.id, type: 'live' });
    await Conversation.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getConversations, getConversation, createConversation, closeConversation, getTotalUnread, deleteConversation };
