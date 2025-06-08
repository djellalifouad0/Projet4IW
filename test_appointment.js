// Test appointment creation
const axios = require('axios');

async function testAppointmentCreation() {
  try {
    // First, get a token by logging in
    console.log('Logging in...');    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com', // Using the test user we just created
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token:', token.substring(0, 20) + '...');
    
    // Create appointment data
    const appointmentDateTime = new Date();
    appointmentDateTime.setHours(appointmentDateTime.getHours() + 2); // 2 hours from now
      const appointmentData = {
      receiverId: 2, // Assuming user ID 2 exists (replace with valid ID)
      conversationId: null, // Set to null since no conversation exists yet
      title: 'Test Appointment',
      description: 'This is a test appointment',
      appointmentDate: appointmentDateTime.toISOString(),
      location: 'Test location'
    };
    
    console.log('Creating appointment with data:', appointmentData);
    
    // Make the appointment creation request
    const response = await axios.post('http://localhost:5000/api/appointments', appointmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Appointment created successfully:', response.data);
    
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testAppointmentCreation();
