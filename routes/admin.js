const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Branch = require('../models/Branch');

// Get all complaints (admin dashboard)
router.get('/complaints', async (req, res) => {
  try {
    const { status, priority, branch_id, hasImages, limit = 100, offset = 0 } = req.query;

    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (branch_id) {
      query.branchId = branch_id;
    }

    if (hasImages === 'true') {
      query.attachments = { $exists: true, $not: { $size: 0 } };
    } else if (hasImages === 'false') {
      query.$or = [
        { attachments: { $exists: false } },
        { attachments: { $size: 0 } }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('branchId', 'name city')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    res.json({
      success: true,
      complaints,
      total: complaints.length
    });

  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ 
      error: 'Failed to fetch complaints' 
    });
  }
});

// Update complaint status
router.put('/complaints/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution, adminNotes } = req.body;

    if (!status || !['pending', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Valid status is required' 
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      {
        status,
        resolution,
        adminNotes
      },
      { new: true, runValidators: true }
    );
    
    if (!complaint) {
      return res.status(404).json({ 
        error: 'Complaint not found' 
      });
    }

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint
    });

  } catch (err) {
    console.error('Error updating complaint status:', err);
    res.status(500).json({ 
      error: 'Failed to update complaint status' 
    });
  }
});

// Get complaint statistics
router.get('/stats', async (req, res) => {
  try {
    const { period = 30 } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get basic stats
    const totalComplaints = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'pending' });
    const inProgress = await Complaint.countDocuments({ status: 'in_progress' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const closed = await Complaint.countDocuments({ status: 'closed' });
    
    const urgent = await Complaint.countDocuments({ priority: 'urgent' });
    const high = await Complaint.countDocuments({ priority: 'high' });
    const medium = await Complaint.countDocuments({ priority: 'medium' });
    const low = await Complaint.countDocuments({ priority: 'low' });
    
    const recentComplaints = await Complaint.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get complaints by type
    const complaintsByType = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$complaintType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get complaints by branch
    const complaintsByBranch = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$branchId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: '_id',
          foreignField: '_id',
          as: 'branch'
        }
      },
      {
        $unwind: '$branch'
      },
      {
        $project: {
          branchName: '$branch.name',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalComplaints,
        pending,
        inProgress,
        resolved,
        closed,
        urgent,
        high,
        medium,
        low,
        recentComplaints,
        complaintsByType,
        complaintsByBranch
      }
    });

  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ 
      error: 'Failed to fetch statistics' 
    });
  }
});

// Export complaints to CSV
router.get('/export', async (req, res) => {
  try {
    const { start_date, end_date, branch_id } = req.query;

    const query = {};
    
    if (start_date || end_date) {
      query.createdAt = {};
      if (start_date) query.createdAt.$gte = new Date(start_date);
      if (end_date) query.createdAt.$lte = new Date(end_date);
    }

    if (branch_id) {
      query.branchId = branch_id;
    }

    const complaints = await Complaint.find(query)
      .populate('branchId', 'name city')
      .sort({ createdAt: -1 });
    
    // Convert to CSV format
    const csvHeader = 'Complaint Number,Customer Name,Customer Email,Customer Phone,Complaint Type,Priority,Status,Description,Created At,Resolution,Branch Name,Branch City\n';
    
    const csvData = complaints.map(complaint => 
      `"${complaint.complaintNumber}","${complaint.customerName}","${complaint.customerEmail || ''}","${complaint.customerPhone || ''}","${complaint.complaintType}","${complaint.priority}","${complaint.status}","${complaint.description.replace(/"/g, '""')}","${complaint.createdAt}","${complaint.resolution || ''}","${complaint.branchId.name}","${complaint.branchId.city}"`
    ).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
    res.send(csv);

  } catch (err) {
    console.error('Error exporting complaints:', err);
    res.status(500).json({ 
      error: 'Failed to export complaints' 
    });
  }
});

module.exports = router;