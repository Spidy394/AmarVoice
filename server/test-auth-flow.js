// Test script to simulate the authentication flow
import fetch from 'node-fetch';

async function testAuthFlow() {
  console.log('=== Testing AmarVoice Auth Flow ===');
  
  try {
    // Step 1: Get login URL
    console.log('\n1. Getting login URL...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login URL received:', loginData.loginUrl);
    } else {
      console.error('Failed to get login URL:', loginResponse.status, loginResponse.statusText);
    }
    
    // Step 2: Check current auth status
    console.log('\n2. Checking auth status...');
    const authCheckResponse = await fetch('http://localhost:5000/api/auth/check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (authCheckResponse.ok) {
      const authData = await authCheckResponse.json();
      console.log('Auth status:', authData);
    } else {
      console.error('Failed to check auth:', authCheckResponse.status, authCheckResponse.statusText);
    }
    
    // Step 3: Try to submit complaint without auth
    console.log('\n3. Trying to submit complaint without authentication...');
    const complaintData = {
      title: 'Test Complaint',
      description: 'This is a test complaint',
      category: 'infrastructure',
      location: {
        address: 'Test Address, Test City'
      }
    };
    
    const complaintResponse = await fetch('http://localhost:5000/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(complaintData)
    });
    
    if (complaintResponse.ok) {
      const complaintResult = await complaintResponse.json();
      console.log('Complaint submitted successfully:', complaintResult);
    } else {
      const error = await complaintResponse.json();
      console.log('Complaint submission failed (expected):', error);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuthFlow();
