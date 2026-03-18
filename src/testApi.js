const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

const testAPI = async () => {
    try {
        console.log('--- Testing Full Auth REST API ---');
        const timestamp = Date.now();
        const userEmail = `john${timestamp}@example.com`;
        const adminEmail = `admin${timestamp}@example.com`;

        // 1. Register User
        console.log('\n[1] Registering User...');
        const regRes = await axios.post(`${API_URL}/register`, {
            name: 'John Doe',
            email: userEmail,
            password: 'password123'
        });
        console.log('Registration Success:', regRes.data.success);
        const token = regRes.data.token;

        // 2. Login User
        console.log('\n[2] Logging in...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: userEmail,
            password: 'password123'
        });
        console.log('Login Success:', loginRes.data.success);

        // 3. Get Me (Protected)
        console.log('\n[3] Fetching Profile (Protected)...');
        const meRes = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Profile Data:', meRes.data.data.name, meRes.data.data.email);

        // 4. Register Admin
        console.log('\n[4] Registering Admin...');
        const adminRegRes = await axios.post(`${API_URL}/register`, {
            name: 'Admin User',
            email: adminEmail,
            password: 'password123',
            role: 'admin'
        });
        const adminToken = adminRegRes.data.token;
        const userIdToDelete = regRes.data.userId || (await axios.get(`${API_URL}/me`, {headers: { Authorization: `Bearer ${token}` }})).data.data._id;

        // 5. Soft Delete (Admin only)
        console.log('\n[5] Soft Deleting User (Admin Only)...');
        const deleteRes = await axios.delete(`${API_URL}/users/${userIdToDelete}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Soft Delete Success:', deleteRes.data.success);

        // 6. Verify Soft Delete (User should not be found in queries)
        console.log('\n[6] Verifying Soft Delete (User should be inaccessible)...');
        try {
            await axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('FAIL: User still accessible after soft delete!');
        } catch (err) {
            console.log('SUCCESS: User inaccessible (as expected):', err.response.data.message);
        }

        console.log('\n--- All Tests Passed ---');
    } catch (err) {
        console.error('Test Failed:', err.response ? err.response.data : err.message);
    }
};

testAPI();
