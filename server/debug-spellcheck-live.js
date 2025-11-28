import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAMZzszrUCxuUSBo1I7VraT_wSDuMllHMM" });

async function main() {
    console.log("Starting live debug of spell check logic...");

    const questions = [
        { id: 1, text: "Le patient présente une iniative anormale et une tachycardie." },
        { id: 2, text: "Ceci est une phrase correcte sans erreur." },
        { id: 3, text: "L'examen révèle une inflamation sévère." }
    ];

    const ignoredSet = new Set(["tachycardie"]);

    const questionsText = questions.map(q => `ID: ${q.id}\nText: ${q.text}`).join('\n\n');

    const prompt = `
You are a professional proofreader for French medical exams. 
Analyze the following questions for spelling and grammar errors.

RULES:
1. Identify REAL typos (e.g., "iniative" -> "initiative", "tachycardie" -> "tachycardie" is correct).
2. IGNORE technical medical terms, drug names, and proper nouns unless they are clearly misspelled.
3. IGNORE ignored words: ${Array.from(ignoredSet).join(', ')}.
4. Return ONLY a JSON array.

FORMAT:
[
  { 
    "id": 123, 
    "corrections": [
      { "original": "iniative", "correction": "initiative" }
    ],
    "suggestion": "Corrected sentence or explanation" 
  }
]

If a question has no errors, DO NOT include it in the array.

QUESTIONS TO ANALYZE:
${questionsText}
`;

    try {
        console.log("Sending request to Gemini...");
        const response = await ai.models.generateContent({
            model: "gemini-1.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        console.log("Response received!");
        console.log("Raw Text:", response.text);

        const jsonStr = response.text.replace(/```json\n?|\n?```/g, '').trim();
        const results = JSON.parse(jsonStr);
        console.log("Parsed JSON:", JSON.stringify(results, null, 2));

    } catch (err) {
        console.error("ERROR:", err);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", await err.response.text());
        }
    }
}

main();
