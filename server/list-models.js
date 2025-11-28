import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyC9jLkXKejUabkYNJCNnJhbw8mXEIOcAAA";
const client = new GoogleGenAI({ apiKey });

async function main() {
    console.log("Listing models...");
    try {
        const response = await client.models.list();
        console.log("Models found:");
        for await (const model of response) {
            console.log(`- ${model.name} (${model.displayName})`);
            if (model.supportedGenerationMethods) {
                console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

main();
