const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    default: '30 minutes'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
