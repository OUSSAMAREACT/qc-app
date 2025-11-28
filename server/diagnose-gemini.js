import { GoogleGenerativeAI } from '@google/generative-ai';

const key = "AIzaSyAjrNsQRv7ZXntMsIA__JqBM3oNZsJshvg";
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
        console.error(`Failed: ${error.message.substring(0, 100)}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
        }
        return false;
    }
}

async function runDiagnostics() {
    console.log("Starting diagnostics...");

    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-pro",
        "gemini-1.0-pro",
        "models/gemini-1.5-flash"
    ];

    for (const m of modelsToTest) {
        await testModel(m);
    }
}

runDiagnostics();
