import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAMZzszrUCxuUSBo1I7VraT_wSDuMllHMM" });

async function main() {
    console.log("Testing gemini-1.5-flash with new SDK...");
    try {
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: "Explain how AI works in a few words",
        });
        console.log("Success:", response.text);
    } catch (error) {
        console.error("Error:", error);
        if (error.response) {
            console.log("Status:", error.response.status);
        }
    }
}

main();
