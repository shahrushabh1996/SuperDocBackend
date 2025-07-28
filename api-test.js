const axios = require('axios');

// Your bearer token
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODc4YTA3NjExMWVhZDE4YThiZmY5N2EiLCJtb2JpbGUiOiI3OTkwMDg5OTg0Iiwib3JnYW5pemF0aW9uSWQiOiI2ODc4YTA3NjExMWVhZDE4YThiZmY5N2QiLCJpYXQiOjE3NTMxMTQzNTIsImV4cCI6MTc1MzIwMDc1Mn0.yjn2kNIsOXf10WGwyCciMw3W-L2fbGmxXfPmIGX-l-8';

// Base URL for your API
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Create axios instance with default headers
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Example API calls
async function testAPI() {
  try {
    // Test user endpoints
    console.log('Testing User API...');
    const userResponse = await api.get('/user/profile');
    console.log('User Profile:', userResponse.data);

    // Test document endpoints
    console.log('\nTesting Document API...');
    const documentsResponse = await api.get('/documents');
    console.log('Documents:', documentsResponse.data);

    // Test organization endpoints
    console.log('\nTesting Organization API...');
    const orgResponse = await api.get('/organization');
    console.log('Organization:', orgResponse.data);

  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run tests
testAPI();