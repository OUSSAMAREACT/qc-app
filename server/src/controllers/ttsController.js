import { GoogleGenAI } from "@google/genai";
import mime from 'mime';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import prisma from '../prisma.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const client = new GoogleGenAI({ apiKey });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audioDir = path.join(__dirname, '../../uploads/audio');

// Ensure audio directory exists
(async () => {
    try {
        await fs.mkdir(audioDir, { recursive: true });
    } catch (err) {
        console.error("Failed to create audio directory:", err);
    }
})();

export const generateSpeech = async (req, res) => {
    try {
        const { text, voice1 = 'Zephyr', voice2 = 'Puck', questionId } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Text is required" });
        }

        // 1. Check DB/Cache if questionId is provided
        if (questionId) {
            const question = await prisma.question.findUnique({ where: { id: parseInt(questionId) } });

            if (question && question.audioFile) {
                const filePath = path.join(audioDir, question.audioFile);
                try {
                    await fs.access(filePath);
                    console.log(`Serving cached audio for question ${questionId}: ${question.audioFile}`);

                    const stat = await fs.stat(filePath);
                    res.setHeader('Content-Type', 'audio/wav');
                    res.setHeader('Content-Length', stat.size);

                    const fileStream = (await import('fs')).createReadStream(filePath);
                    fileStream.pipe(res);
                    return;
                } catch (err) {
                    console.log(`Cached file not found on disk, regenerating: ${question.audioFile}`);
                    // File missing, proceed to generate
                }
            }
        } else {
            // Fallback: Hash-based caching for non-question text
            const hash = crypto.createHash('md5').update(text + voice1 + voice2).digest('hex');
            const filename = `hash_${hash}.wav`;
            const filePath = path.join(audioDir, filename);

            try {
                await fs.access(filePath);
                console.log(`Serving cached audio for hash ${hash}`);
                const stat = await fs.stat(filePath);
                res.setHeader('Content-Type', 'audio/wav');
                res.setHeader('Content-Length', stat.size);
                const fileStream = (await import('fs')).createReadStream(filePath);
                fileStream.pipe(res);
                return;
            } catch (err) {
                // Not cached
            }
        }

        // 2. Generate Audio via Gemini
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
                    const wavHeader = createWavHeader(pcmData.length, 24000, 1, 16);
                    const wavBuffer = Buffer.concat([wavHeader, pcmData]);

                    // 3. Save to Cache
                    let filename;
                    if (questionId) {
                        filename = `q_${questionId}_${Date.now()}.wav`;
                        // Update DB
                        await prisma.question.update({
                            where: { id: parseInt(questionId) },
                            data: { audioFile: filename }
                        });
                    } else {
                        const hash = crypto.createHash('md5').update(text + voice1 + voice2).digest('hex');
                        filename = `hash_${hash}.wav`;
                    }

                    const filePath = path.join(audioDir, filename);
                    await fs.writeFile(filePath, wavBuffer);
                    console.log(`Saved audio to cache: ${filename}`);

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

    // RIFF identifier
    header.write('RIFF', 0);
    // file length
    header.writeUInt32LE(36 + dataLength, 4);
    // RIFF type
    header.write('WAVE', 8);
    // format chunk identifier
    header.write('fmt ', 12);
    // format chunk length
    header.writeUInt32LE(16, 16);
    // sample format (raw)
    header.writeUInt16LE(1, 20);
    // channel count
    header.writeUInt16LE(numChannels, 22);
    // sample rate
    header.writeUInt32LE(sampleRate, 24);
    // byte rate (sample rate * block align)
    header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
    // block align (channel count * bytes per sample)
    header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
    // bits per sample
    header.writeUInt16LE(bitsPerSample, 34);
    // data chunk identifier
    header.write('data', 36);
    // data chunk length
    header.writeUInt32LE(dataLength, 40);

    return header;
}
