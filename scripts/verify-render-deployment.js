#!/usr/bin/env node

// Render Deployment Verification Script
const http = require('http');
const https = require('https');

const APP_URL = process.argv[2] || 'https://nit-itvms.onrender.com';

console.log('🔍 Verifying Render deployment...');
console.log('📍 URL:', APP_URL);

// Test health endpoint
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/health', APP_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Health check response:', response);
          resolve(response);
        } catch (error) {
          console.error('❌ Invalid JSON response:', data);
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test API endpoints
async function testAPIEndpoints() {
  const endpoints = [
    '/api/vehicles',
    '/api/drivers',
    '/api/trips',
    '/api/maintenance'
  ];

  console.log('\n🧪 Testing API endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${APP_URL}${endpoint}`);
      const data = await response.json();
      console.log(`✅ ${endpoint}: ${data.success ? 'Success' : 'Failed'}`);
      if (data.data) {
        console.log(`   📊 Records: ${data.data.length}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Main verification
async function main() {
  try {
    // Test health endpoint
    const health = await testHealthEndpoint();
    
    if (health.status === 'ok') {
      console.log('✅ Server is healthy');
      
      // Test API endpoints
      await testAPIEndpoints();
      
      console.log('\n🎉 Render deployment verification completed!');
      console.log('🌐 Your app is live at:', APP_URL);
    } else {
      console.error('❌ Server health check failed');
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

main();
