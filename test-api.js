// Simple test script to verify API integration
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test login endpoint
    const loginData = {
      email: 'ishimwepacifique@gmail.com',
      password: 'password123' // You'll need to use the actual password
    };
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      console.log('✅ Login successful:', loginResponse.data);
      
      const token = loginResponse.data.data.token;
      
      // Test authenticated endpoints
      const headers = { Authorization: `Bearer ${token}` };
      
      // Test staff endpoint
      const staffResponse = await axios.get(`${API_BASE_URL}/staff`, { headers });
      console.log('✅ Staff endpoint:', staffResponse.data);
      
      // Test clients endpoint
      const clientsResponse = await axios.get(`${API_BASE_URL}/clients`, { headers });
      console.log('✅ Clients endpoint:', clientsResponse.data);
      
      // Test shifts endpoint
      const shiftsResponse = await axios.get(`${API_BASE_URL}/shifts`, { headers });
      console.log('✅ Shifts endpoint:', shiftsResponse.data);
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data || loginError.message);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('Make sure the backend server is running on http://localhost:3001');
  }
}

testAPI();