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

        const contents = [
            {
                role: 'user',
                parts: [{ text: text }],
            },
        ];

        console.log("Generating speech for text:", text.substring(0, 50) + "...");
        const response = await client.models.generateContent({
            model: modelName,
            config: config,
            contents: contents,
        });

        console.log("Gemini Response received");

        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData) {
                    console.log("Audio data found in response");
                    const pcmData = Buffer.from(part.inlineData.data, 'base64');

                    // Gemini TTS defaults to 24kHz, Mono, 16-bit PCM (audio/l16)
                    // We need to wrap it in a WAV header for the browser to play it.
                    const wavHeader = createWavHeader(pcmData.length, 24000, 1, 16);
                    const wavBuffer = Buffer.concat([wavHeader, pcmData]);

                    res.setHeader('Content-Type', 'audio/wav');
                    res.setHeader('Content-Length', wavBuffer.length);
                    res.send(wavBuffer);
                    return;
                }
            }
        } else {
            console.error("No candidates in Gemini response:", JSON.stringify(response, null, 2));
        }

        res.status(500).json({ message: "No audio generated" });

    } catch (error) {
        console.error("TTS Error Details:", error);
        if (error.response) {
            console.error("API Response Error:", JSON.stringify(error.response, null, 2));
        }
        res.status(500).json({
            message: "Error generating speech",
            details: error.message,
            code: error.status || 500
        });
    }
};

function createWavHeader(dataLength, sampleRate, numChannels, bitsPerSample) {
    const header = Buffer.alloc(44);

    // RIFF chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4); // ChunkSize
    header.write('WAVE', 8);

    // fmt sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
    header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
    header.writeUInt16LE(bitsPerSample, 34);

    // data sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);

    return header;
}
