const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const Joi = require('joi');

// Validation schema for branch
const branchSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(500).required(),
  city: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  managerName: Joi.string().min(2).max(100).allow('').optional(),
  isActive: Joi.boolean().default(true)
});

// Get all branches
router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    
    res.json({
      success: true,
      branches
    });

  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ 
      error: 'Failed to fetch branches' 
    });
  }
});

// Get active branches only
router.get('/active', async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).sort({ name: 1 });
    res.json(branches);
  } catch (error) {
    console.error('Error fetching active branches:', error);
    res.status(500).json({ error: 'Failed to fetch active branches' });
  }
});

// Get branch by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const branch = await Branch.findById(id);
    
    if (!branch) {
      return res.status(404).json({ 
        error: 'Branch not found' 
      });
    }

    res.json({
      success: true,
      branch
    });

  } catch (err) {
    console.error('Error fetching branch:', err);
    res.status(500).json({ 
      error: 'Failed to fetch branch' 
    });
  }
});

// Create new branch (admin only)
router.post('/', async (req, res) => {
  try {
    const { error, value } = branchSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details[0].message 
      });
    }

    const branch = new Branch(value);
    await branch.save();
    
    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      branch
    });

  } catch (err) {
    console.error('Error creating branch:', err);
    res.status(500).json({ 
      error: 'Failed to create branch' 
    });
  }
});

// Update branch (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = branchSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details[0].message 
      });
    }

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );
    
    if (!branch) {
      return res.status(404).json({ 
        error: 'Branch not found' 
      });
    }

    res.json({
      success: true,
      message: 'Branch updated successfully',
      branch
    });

  } catch (err) {
    console.error('Error updating branch:', err);
    res.status(500).json({ 
      error: 'Failed to update branch' 
    });
  }
});

// Delete branch (soft delete by setting isActive to false)
router.delete('/:id', async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    res.json({
      success: true,
      message: 'Branch deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating branch:', error);
    res.status(500).json({ error: 'Failed to deactivate branch' });
  }
});

// Restore branch (set isActive to true)
router.patch('/:id/restore', async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id, 
      { isActive: true }, 
      { new: true }
    );
    
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    res.json({
      success: true,
      message: 'Branch restored successfully',
      branch: branch
    });
  } catch (error) {
    console.error('Error restoring branch:', error);
    res.status(500).json({ error: 'Failed to restore branch' });
  }
});

module.exports = router;