import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const client = new GoogleGenAI({ apiKey });

async function main() {
    console.log("Testing with @google/genai SDK...");
    try {
        // Try to list models if possible, or just test the specific one
        // The new SDK might have different methods.
        // Let's try to generate speech if that method exists, or content.

        console.log("Attempting to use model: gemini-2.5-flash-preview-tts");
        // Note: The model name usually doesn't have 'models/' prefix in new SDK unless specified

        // Check if there is a specific 'speech' namespace or method
        // If not, we try generateContent

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
        });

        console.log("Response:", response);
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Status Text:", error.response.statusText);
        }
    }
}

main();
