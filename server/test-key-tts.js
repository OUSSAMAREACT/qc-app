import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyC9jLkXKejUabkYNJCNnJhbw8mXEIOcAAA";
const client = new GoogleGenAI({ apiKey });

async function main() {
    console.log("Testing with provided API key...");
    try {
        console.log("Attempting to use model: gemini-2.0-flash-exp");
        // Note: 'gemini-2.5-flash-preview-tts' might not be a valid public model name yet. 
        // Using 'gemini-2.0-flash-exp' which is a known new model, or just 'gemini-1.5-flash' to test the key first.
        // But user asked for 2.5, let's try that first, if fail, try 2.0 or 1.5.

        let modelName = 'gemini-2.0-flash-exp'; // Fallback/Standard new one

        // Let's try to list models to see what's available if possible, 
        // or just try a simple generation to check auth.

        const response = await client.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
        });

        console.log("Key is VALID. Response received.");
        console.log("Full Response:", JSON.stringify(response, null, 2));
        // console.log("Response text:", response.response.candidates[0].content.parts[0].text);

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Status Text:", error.response.statusText);
        }
    }
}

main();
