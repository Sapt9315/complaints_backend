const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const connectDB = require('../config/database');

async function seedAdmin() {
  try {
    // Connect to database
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('You can change the password from the admin panel.');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      password: 'admin123'
    });

    await admin.save();
    
    console.log('✅ Default admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    console.log('You can change it from the admin panel or directly from the database.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
