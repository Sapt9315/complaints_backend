const mongoose = require('mongoose');
const Branch = require('./models/Branch');
require('dotenv').config();

const showQRCodes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const branches = await Branch.find();
    
    console.log('\n📱 QR Code URLs:');
    console.log('==================');
    
    branches.forEach(branch => {
      console.log(`\n${branch.name}:`);
      console.log(`  URL: ${branch.qrCodeUrl}`);
      console.log(`  QR File: qr-code-${branch.name.replace(/\s+/g, '-').toLowerCase()}.png`);
    });
    
    console.log('\n📁 QR Code Files Location:');
    console.log('backend/qr-codes/');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

showQRCodes();
