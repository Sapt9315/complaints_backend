const mongoose = require('mongoose');
const Branch = require('../models/Branch');
require('dotenv').config();

const seedBranches = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing branches
    await Branch.deleteMany({});
    console.log('Cleared existing branches');

    // Insert sample branches
    const branches = [
      {
        name: 'Main Branch',
        address: '123 Main Street',
        city: 'Downtown',
        phone: '+1-555-0101',
        email: 'main@supermarket.com',
        managerName: 'John Smith'
      },
      {
        name: 'North Branch',
        address: '456 North Avenue',
        city: 'Northside',
        phone: '+1-555-0102',
        email: 'north@supermarket.com',
        managerName: 'Jane Doe'
      },
      {
        name: 'South Branch',
        address: '789 South Road',
        city: 'Southside',
        phone: '+1-555-0103',
        email: 'south@supermarket.com',
        managerName: 'Mike Johnson'
      },
      {
        name: 'East Branch',
        address: '321 East Boulevard',
        city: 'Eastside',
        phone: '+1-555-0104',
        email: 'east@supermarket.com',
        managerName: 'Sarah Wilson'
      },
      {
        name: 'West Branch',
        address: '654 West Street',
        city: 'Westside',
        phone: '+1-555-0105',
        email: 'west@supermarket.com',
        managerName: 'David Brown'
      }
    ];

    await Branch.insertMany(branches);
    console.log('Sample branches inserted successfully');

    // Display inserted branches
    const insertedBranches = await Branch.find();
    console.log('\nInserted branches:');
    insertedBranches.forEach(branch => {
      console.log(`- ${branch.name} (ID: ${branch._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedBranches();
