const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Branch = require('../models/Branch');
const Joi = require('joi');

// Validation schema for complaint submission
const complaintSchema = Joi.object({
  branchId: Joi.string().required(),
  customerName: Joi.string().min(2).max(100).required(),
  customerPhone: Joi.string().pattern(/^[0-9+\-\s()]+$/).allow('').optional(),
  complaintType: Joi.string().valid(
    'product_quality',
    'service_issue',
    'staff_behavior',
    'pricing_dispute',
    'cleanliness',
    'waiting_time',
    'other'
  ).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  description: Joi.string().min(10).max(2000).optional(), // Made optional since dynamic fields will handle this
  purchaseDate: Joi.date().allow('').optional(),
  receiptNumber: Joi.string().allow('').optional(),
  attachments: Joi.array().items(Joi.object({
    imageUrl: Joi.string().uri().required(),
    publicId: Joi.string().required()
  })).optional(),
  // Dynamic fields - allow any additional fields
  dynamicFields: Joi.object().optional()
}).unknown(true); // Allow additional fields for dynamic data

// Submit a new complaint
router.post('/', async (req, res) => {
  try {
    const { error, value } = complaintSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details[0].message 
      });
    }

    // Check if branch exists
    const branch = await Branch.findById(value.branchId);
    if (!branch) {
      return res.status(400).json({ 
        error: 'Invalid branch ID' 
      });
    }

    const complaint = new Complaint({
      ...value,
      branchId: value.branchId,
      dynamicFields: value.dynamicFields || {}
    });

    // Generate complaint number if not already set
    if (!complaint.complaintNumber) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      complaint.complaintNumber = `COMP-${timestamp}-${random}`;
    }

    await complaint.save();
    await complaint.populate('branchId', 'name address city');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber
    });

  } catch (err) {
    console.error('Error submitting complaint:', err);
    res.status(500).json({ 
      error: 'Failed to submit complaint',
      message: 'Please try again later'
    });
  }
});

// Get complaint status by complaint number
router.get('/status/:complaintNumber', async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    
    const complaint = await Complaint.findOne({ complaintNumber })
      .populate('branchId', 'name address city');
    
    if (!complaint) {
      return res.status(404).json({ 
        error: 'Complaint not found' 
      });
    }

    res.json({
      success: true,
      complaint: {
        id: complaint._id,
        complaintNumber: complaint.complaintNumber,
        status: complaint.status,
        priority: complaint.priority,
        complaintType: complaint.complaintType,
        description: complaint.description,
        branchName: complaint.branchId.name,
        branchAddress: complaint.branchId.address,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        resolution: complaint.resolution
      }
    });

  } catch (err) {
    console.error('Error fetching complaint status:', err);
    res.status(500).json({ 
      error: 'Failed to fetch complaint status' 
    });
  }
});

// Get complaints by branch (for branch managers)
router.get('/branch/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    const query = { branchId };
    
    if (status) {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .populate('branchId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    res.json({
      success: true,
      complaints,
      total: complaints.length
    });

  } catch (err) {
    console.error('Error fetching branch complaints:', err);
    res.status(500).json({ 
      error: 'Failed to fetch complaints' 
    });
  }
});

module.exports = router;