// Test API Form Submissions
// This script tests the actual API endpoints for form submissions

const http = require('http');

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : {}
                    };
                    resolve(response);
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testFormSubmissions() {
    console.log('🔍 Testing API form submissions...');
    
    const baseUrl = 'http://localhost:8080/api';
    
    try {
        // Test vehicle creation
        console.log('\n🚗 Testing vehicle creation API...');
        const vehicleData = {
            plate_number: 'API-TEST-001',
            vehicle_type: 'Bus',
            model: 'API Test Model',
            manufacture_year: 2023,
            capacity: 30,
            status: 'Active',
            fuel_type: 'Diesel'
        };
        
        const vehicleResponse = await makeRequest({
            hostname: 'localhost',
            port: 8080,
            path: '/api/vehicles',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, vehicleData);
        
        console.log(`Vehicle creation status: ${vehicleResponse.statusCode}`);
        if (vehicleResponse.statusCode === 200 || vehicleResponse.statusCode === 201) {
            console.log('✅ Vehicle created successfully!');
            console.log('Response:', JSON.stringify(vehicleResponse.body, null, 2));
        } else {
            console.log('❌ Vehicle creation failed');
            console.log('Response:', JSON.stringify(vehicleResponse.body, null, 2));
        }
        
        // Test driver creation
        console.log('\n👨‍💼 Testing driver creation API...');
        const driverData = {
            full_name: 'API Test Driver',
            license_number: 'API-TEST-001',
            phone_number: '255-987-654321',
            email: 'testdriver@nit.ac.tz',
            experience_years: 3,
            license_expiry: '2025-12-31',
            status: 'Active'
        };
        
        const driverResponse = await makeRequest({
            hostname: 'localhost',
            port: 8080,
            path: '/api/drivers',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, driverData);
        
        console.log(`Driver creation status: ${driverResponse.statusCode}`);
        if (driverResponse.statusCode === 200 || driverResponse.statusCode === 201) {
            console.log('✅ Driver created successfully!');
            console.log('Response:', JSON.stringify(driverResponse.body, null, 2));
        } else {
            console.log('❌ Driver creation failed');
            console.log('Response:', JSON.stringify(driverResponse.body, null, 2));
        }
        
        // Test trip creation
        console.log('\n🛣️ Testing trip creation API...');
        const tripData = {
            route_from: 'API Test Origin',
            route_to: 'API Test Destination',
            driver_id: 1,
            vehicle_id: 1,
            trip_date: '2026-01-31',
            departure_time: '14:00',
            arrival_time: '16:00',
            distance_km: 25.5,
            fuel_consumed: 8.5,
            passenger_count: 15,
            notes: 'API Test Trip',
            status: 'Scheduled'
        };
        
        const tripResponse = await makeRequest({
            hostname: 'localhost',
            port: 8080,
            path: '/api/trips',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, tripData);
        
        console.log(`Trip creation status: ${tripResponse.statusCode}`);
        if (tripResponse.statusCode === 200 || tripResponse.statusCode === 201) {
            console.log('✅ Trip created successfully!');
            console.log('Response:', JSON.stringify(tripResponse.body, null, 2));
        } else {
            console.log('❌ Trip creation failed');
            console.log('Response:', JSON.stringify(tripResponse.body, null, 2));
        }
        
        console.log('\n✅ API form submission tests completed!');
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.log('\n💡 Make sure your local server is running on port 8080');
        console.log('   Run: npm start');
    }
}

testFormSubmissions();
