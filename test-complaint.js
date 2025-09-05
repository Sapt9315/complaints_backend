const axios = require('axios');

const testComplaintSubmission = async () => {
  try {
    console.log('Testing complaint submission...');
    
    const testData = {
      branchId: '68bae9b297b93087a2eb417d',
      customerName: 'Test Customer',
      complaintType: 'product_quality',
      description: 'This is a test complaint to verify the system is working correctly.'
    };

    const response = await axios.post('http://localhost:3000/api/complaints', testData);
    
    console.log('✅ Complaint submitted successfully!');
    console.log('Complaint ID:', response.data.complaintId);
    console.log('Complaint Number:', response.data.complaintNumber);
    
  } catch (error) {
    console.error('❌ Error submitting complaint:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.error || error.message);
    console.error('Details:', error.response?.data?.details);
  }
};

testComplaintSubmission();
