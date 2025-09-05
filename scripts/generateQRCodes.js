const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const Branch = require('../models/Branch');
const mongoose = require('mongoose');
require('dotenv').config();

const generateQRCodes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create qr-codes directory if it doesn't exist
    const qrDir = path.join(__dirname, '../qr-codes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // Get all branches
    const branches = await Branch.find();
    console.log(`Found ${branches.length} branches`);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    for (const branch of branches) {
      // Generate QR code URL
      const qrUrl = `${frontendUrl}/complaint/${branch._id}`;
      
      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Save QR code as PNG
      const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
      const fileName = `qr-code-${branch.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      const filePath = path.join(qrDir, fileName);
      
      fs.writeFileSync(filePath, qrCodeBuffer);
      
      // Update branch with QR code URL
      branch.qrCodeUrl = qrUrl;
      await branch.save();

      console.log(`Generated QR code for ${branch.name}: ${fileName}`);
      console.log(`QR URL: ${qrUrl}`);
    }

    console.log('\nAll QR codes generated successfully!');
    console.log(`QR codes saved in: ${qrDir}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error generating QR codes:', error);
    process.exit(1);
  }
};

generateQRCodes();
