import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAMZzszrUCxuUSBo1I7VraT_wSDuMllHMM" });

async function main() {
    console.log("Testing gemini-3-pro-preview...");
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: "Explain how AI works in a few words",
        });
        console.log("Success! Response:", response.text);
    } catch (error) {
        console.error("Error with gemini-3-pro-preview:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
        }
    }
}

main();
