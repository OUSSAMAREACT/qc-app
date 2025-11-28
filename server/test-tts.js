import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
    console.log("Checking available models...");
    try {
        // This might not list all beta/preview models, but good to check
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-tts" });
        console.log("Model initialized:", model.model);

        // Try to generate content (text) first to see if it exists
        const result = await model.generateContent("Hello");
        console.log("Text generation result:", result.response.text());

    } catch (error) {
        console.error("Error with gemini-2.5-flash-preview-tts:", error.message);
    }

    console.log("\nListing all models:");
    try {
        // Note: listModels is not directly on genAI instance in some versions, 
        // but let's try the standard way if available or just check known ones.
        // Actually, for @google/generative-ai, we might not have a list method easily accessible 
        // without the ModelManager, let's try to just use the specific model the user asked for.
    } catch (e) {
        console.log(e);
    }
}

main();
