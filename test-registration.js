// Test script to verify registration works
// Save as: test-registration.js

const http = require('http');

const testData = {
  email: 'test@company.com',
  password: 'Password123!',
  businessName: 'Test Company',
  contactPerson: 'John Doe',
  phone: '+91 9876543210',
  gstNumber: '27AAPCT1234K1Z0'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(postData);
req.end();
