import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = "AIzaSyC9jLkXKejUabkYNJCNnJhbw8mXEIOcAAA";
const client = new GoogleGenAI({ apiKey });

async function main() {
    console.log("Testing Advanced TTS...");

    // Config from user snippet
    const config = {
        temperature: 1,
        responseModalities: ['audio'], // This is the key part!
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
                    },
                    {
                        speaker: 'Speaker 2',
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Puck'
                            }
                        }
                    },
                ]
            },
        },
    };

    // Try Flash first as requested originally, if fails, we know Pro works per snippet
    const modelName = 'models/gemini-2.5-flash-preview-tts';
    // const modelName = 'models/gemini-2.5-pro-preview-tts';

    console.log(`Using model: ${modelName}`);

    try {
        const response = await client.models.generateContent({
            model: modelName,
            config: config,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `Read aloud in a warm, welcoming tone.
Speaker 1: Hello! This is a test of the Gemini TTS system.
Speaker 2: We are testing the voice switching capabilities.`,
                        },
                    ],
                },
            ],
        });

        console.log("Response received.");

        // Handle response (non-stream for simplicity first, or stream if needed)
        // The snippet used stream, but generateContent should also work.

        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content.parts;
            for (const part of parts) {
                if (part.text) {
                    console.log("Text part:", part.text);
                }
                if (part.inlineData) {
                    console.log("Binary part received! MimeType:", part.inlineData.mimeType);
                    const buffer = Buffer.from(part.inlineData.data, 'base64');
                    fs.writeFileSync('output_advanced.wav', buffer);
                    console.log("Saved to output_advanced.wav");
                }
            }
        } else {
            console.log("No candidates found.");
            console.log(JSON.stringify(response, null, 2));
        }

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Status Text:", error.response.statusText);
        }
    }
}

main();
