import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

async function testDelete() {
    try {
        // 1. Login as admin
        console.log("Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log("Logged in. Token:", token ? "OK" : "MISSING");

        // 2. Create a dummy category
        console.log("Creating dummy category...");
        const createRes = await axios.post(`${API_URL}/categories`, {
            name: 'Category To Delete'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const categoryId = createRes.data.id;
        console.log("Created category with ID:", categoryId);

        // 3. Delete the category
        console.log("Deleting category...");
        await axios.delete(`${API_URL}/categories/${categoryId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Category deleted successfully.");

    } catch (error) {
        console.error("Test failed:", error.response ? error.response.data : error.message);
    }
}

testDelete();
