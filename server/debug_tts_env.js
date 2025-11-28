import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Checking Environment...");
console.log("API Key Present:", !!apiKey);
if (apiKey) {
    console.log("API Key Prefix:", apiKey.substring(0, 10) + "...");
} else {
    console.error("CRITICAL: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const client = new GoogleGenAI({ apiKey });

async function testTTS() {
    console.log("Testing Gemini TTS...");
    try {
        const config = {
            temperature: 1,
            responseModalities: ['audio'],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        {
                            speaker: 'Speaker 1',
                            voiceConfig: {
                                prebuiltVoiceConfig: {
                                    voiceName: 'Zephyr'
                                }
                            }
                        }
                    ]
                },
            },
        };

        const modelName = 'models/gemini-2.5-flash-preview-tts';
        console.log(`Model: ${modelName}`);

        const response = await client.models.generateContent({
            model: modelName,
            config: config,
            contents: [{ role: 'user', parts: [{ text: "Hello, this is a test." }] }],
        });

        console.log("Response received.");
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const part = candidates[0].content.parts[0];
            if (part.inlineData) {
                console.log("SUCCESS: Audio data received.");
                console.log("MimeType:", part.inlineData.mimeType);
                console.log("Data Length:", part.inlineData.data.length);
            } else {
                console.error("FAILURE: No inlineData in response.");
            }
        } else {
            console.error("FAILURE: No candidates in response.");
        }

    } catch (error) {
        console.error("TTS FAILED:", error.message);
        if (error.response) {
            console.error("Error Details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testTTS();
