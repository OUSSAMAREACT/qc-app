import { GoogleGenAI } from "@google/genai";
import mime from 'mime';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const client = new GoogleGenAI({ apiKey });

export const generateSpeech = async (req, res) => {
    try {
        const { text, voice1 = 'Zephyr', voice2 = 'Puck' } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Text is required" });
        }

        // Config for Gemini TTS
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
                                    voiceName: voice1
                                }
                            }
                        },
                        {
                            speaker: 'Speaker 2',
                            voiceConfig: {
                                prebuiltVoiceConfig: {
                                    voiceName: voice2
                                }
                            }
                        },
                    ]
                },
            },
        };

        const modelName = 'models/gemini-2.5-flash-preview-tts';

        // Construct a prompt that encourages using both speakers if applicable, 
        // or just reads the text. For now, we'll wrap the text to ensure it's read.
        // If the text doesn't have speaker labels, we might want to just use Speaker 1.
        // But the user's snippet suggests explicit speaker labels work best.
        // Let's assume the frontend sends raw text, and we might wrap it or just send it.
        // For a quiz question, we might want "Question: ... Answer 1: ..."

        const contents = [
            {
                role: 'user',
                parts: [{ text: text }],
            },
        ];

        const response = await client.models.generateContent({
            model: modelName,
            config: config,
            contents: contents,
        });

        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData) {
                    const buffer = Buffer.from(part.inlineData.data, 'base64');
                    const mimeType = part.inlineData.mimeType || 'audio/wav';

                    res.setHeader('Content-Type', mimeType);
                    res.setHeader('Content-Length', buffer.length);
                    res.send(buffer);
                    return;
                }
            }
        }

        res.status(500).json({ message: "No audio generated" });

    } catch (error) {
        console.error("TTS Error:", error);
        // Return the specific error message to help debugging
        res.status(500).json({
            message: "Error generating speech",
            details: error.message,
            code: error.status || 500
        });
    }
};
