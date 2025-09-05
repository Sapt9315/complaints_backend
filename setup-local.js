#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create .env file for local development
const envContent = `# Environment Variables for Customer Complaints Backend - LOCAL DEVELOPMENT

# MongoDB Configuration (Local)
MONGODB_URI=mongodb://localhost:27017/customer_complaints

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001

# Admin Configuration (optional - for future admin authentication)
ADMIN_SECRET_KEY=your-secret-key-here

# Cloudinary Configuration
CLOUDINARY_NAME=dxjobesyt
CLOUDINARY_API_KEY=313225726546542
CLOUDINARY_API_SECRET=C48I1yK3ngX2TxOatap2--jGK8I

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email Configuration (if you add email notifications later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file for local development');
  console.log('📝 MongoDB URI: mongodb://localhost:27017/customer_complaints');
  console.log('🌐 Frontend URL: http://localhost:3001');
  console.log('🔧 Server Port: 3000');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
