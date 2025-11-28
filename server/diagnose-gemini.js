import { GoogleGenerativeAI } from '@google/generative-ai';

const key = "AIzaSyAMZzszrUCxuUSBo1I7VraT_wSDuMllHMM";
const genAI = new GoogleGenerativeAI(key);

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    try {
        const result = await model.generateContent("Hello, are you working?");
        const response = result.response;
        console.log(`Success! Response: ${response.text()}`);
        return true;
    } catch (error) {
        console.error(`Failed: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
        }
        return false;
    }
}

async function runDiagnostics() {
    console.log("Starting diagnostics...");
    await testModel("models/gemini-1.5-flash");
}

runDiagnostics();
