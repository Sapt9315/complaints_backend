const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/customer_complaints');

const Branch = require('../models/Branch');

async function updateBranches() {
  try {
    console.log('Updating existing branches to have isActive field...');
    
    // Update all branches that don't have isActive field
    const result = await Branch.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} branches`);
    
    // Show all branches
    const branches = await Branch.find();
    console.log('\nAll branches:');
    branches.forEach(branch => {
      console.log(`- ${branch.name} (${branch.city}) - Active: ${branch.isActive}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating branches:', error);
    process.exit(1);
  }
}

updateBranches();
