import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAMZzszrUCxuUSBo1I7VraT_wSDuMllHMM" });

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-2.0-flash-exp",
    "gemini-3-pro-preview"
];

async function testModel(modelName) {
    console.log(`\n--- Testing ${modelName} ---`);
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: "Hello, are you working?",
        });
        console.log(`✅ SUCCESS: ${modelName}`);
        console.log(`Response: ${response.text.substring(0, 50)}...`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${modelName}`);
        if (error.response) {
            console.log(`Status: ${error.response.status} ${error.response.statusText}`);
        } else {
            console.log(`Error: ${error.message}`);
        }
        return false;
    }
}

async function main() {
    console.log("Starting comprehensive model test...");
    for (const model of models) {
        await testModel(model);
    }
}

main();
