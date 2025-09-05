const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  managerName: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qrCodeUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes
branchSchema.index({ name: 1 });
branchSchema.index({ city: 1 });

module.exports = mongoose.model('Branch', branchSchema);
