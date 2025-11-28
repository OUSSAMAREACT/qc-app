import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAMZzszrUCxuUSBo1I7VraT_wSDuMllHMM" });

async function main() {
    console.log("Testing gemini-3-pro-preview with thinkingLevel: 'low'...");
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: "Explain how AI works in a few words",
            config: {
                thinkingConfig: {
                    thinkingLevel: "low",
                }
            },
        });
        console.log("Success:", response.text);
    } catch (error) {
        console.error("Error:", error);
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Status Text:", error.response.statusText);
        }
    }
}

main();
