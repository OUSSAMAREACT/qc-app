
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5001/api';
let token = '';

async function login() {
    try {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@test.com', // Correct email from seed
            password: 'password123'
        });
        token = res.data.token;
        console.log('Login successful');
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function verifyExplanation() {
    await login();

    try {
        // 1. Create a question with explanation
        const questionData = {
            text: "Question Test Explication " + Date.now(),
            categoryId: 1, // Assuming category 1 exists
            difficulty: "Facile",
            explanation: "Ceci est une explication de test.",
            choices: [
                { text: "Reponse A", isCorrect: true },
                { text: "Reponse B", isCorrect: false }
            ]
        };

        const createRes = await axios.post(`${BASE_URL}/questions`, questionData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const questionId = createRes.data.id;
        console.log('Question created with ID:', questionId);

        // 2. Submit quiz with this question
        const submitData = {
            answers: [
                { questionId: questionId, selectedChoiceIds: [createRes.data.choices.find(c => c.isCorrect).id] }
            ]
        };

        const submitRes = await axios.post(`${BASE_URL}/quiz/submit`, submitData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 3. Check result for explanation
        const resultDetail = submitRes.data.details.find(d => d.questionId === questionId);

        if (resultDetail && resultDetail.explanation === "Ceci est une explication de test.") {
            console.log('SUCCESS: Explanation found in result details.');
        } else {
            console.error('FAILURE: Explanation NOT found or incorrect.', resultDetail);
        }

    } catch (error) {
        console.error('Verification failed:', error.response?.data || error.message);
    }
}

verifyExplanation();
