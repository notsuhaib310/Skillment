const fetch = require('node-fetch');

async function testEmailLogs() {
  try {
    const response = await fetch('http://localhost:5000/api/email/logs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmailLogs(); 