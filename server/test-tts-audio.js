import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

const apiKey = "AIzaSyC9jLkXKejUabkYNJCNnJhbw8mXEIOcAAA";
const client = new GoogleGenAI({ apiKey });

async function main() {
    const modelsToTest = [
        { name: 'models/gemini-2.5-flash-native-audio-latest', config: {} }
    ];

    for (const item of modelsToTest) {
        console.log(`\n--- Testing ${item.name} with config: ${JSON.stringify(item.config)} ---`);
        try {
            const response = await client.models.generateContent({
                model: item.name,
                contents: [{
                    parts: [{ text: 'Hello, this is a test.' }]
                }],
                config: item.config
            });

            console.log("Response received.");
            const candidates = response.candidates;
            if (candidates && candidates.length > 0) {
                const parts = candidates[0].content.parts;
                for (const part of parts) {
                    if (part.text) console.log("Text part:", part.text.substring(0, 50) + "...");
                    if (part.inlineData) console.log("Binary part received! MimeType:", part.inlineData.mimeType);
                }
            } else {
                console.log("No candidates found.");
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    }
}

main();
