const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number']
  },
  complaintType: {
    type: String,
    required: true,
    enum: [
      'product_quality',
      'service_issue',
      'staff_behavior',
      'pricing_dispute',
      'cleanliness',
      'waiting_time',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  description: {
    type: String,
    required: false,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  purchaseDate: {
    type: Date
  },
  receiptNumber: {
    type: String,
    trim: true
  },
  attachments: [{
    imageUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  dynamicFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resolution: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
complaintSchema.index({ branchId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ complaintType: 1 });

// Pre-save middleware to generate complaint number
complaintSchema.pre('save', function(next) {
  if (!this.complaintNumber) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.complaintNumber = `COMP-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
