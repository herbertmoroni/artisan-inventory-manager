const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // For now, make optional until auth is added
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['earrings', 'bracelets', 'necklaces']
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String // Store image URL or base64 for now
  },
  nextImport: {
    type: Boolean,
    default: false
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  soldAt: {
    date: {
      type: Date
    },
    fairId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fair'
    }
  }
});

module.exports = mongoose.model('Item', itemSchema);