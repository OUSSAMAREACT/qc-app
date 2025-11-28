import { GoogleGenerativeAI } from '@google/generative-ai';

console.log("Starting test...");

const key = "AIzaSyAjrNsQRv7ZXntMsIA__JqBM3oNZsJshvg";
const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function testSpellCheck() {
    const text = "Le chantier de la protection sociale est une iniative";
    console.log("Testing text:", text);

    const prompt = `
        You are a proofreader for French medical exams. 
        Analyze the following questions for spelling and grammar errors.
        
        Rules:
        1. Ignore technical medical terms, drug names, and Latin terms.
        2. Ignore proper nouns (author names).
        3. Flag only REAL spelling or grammar mistakes.
        4. Return a JSON array of objects.
        5. Each object must have: "id" (number), "typos" (array of strings - the exact misspelled words), "correction" (string - the corrected sentence).
        6. Only include questions that have errors.
        7. Do not include questions with no errors.

        Ignored words (do not flag these): (none)

        Questions to analyze:
        ${JSON.stringify([{ id: 1, text: text }])}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        console.log("Raw Response:", response.text());
    } catch (err) {
        console.error("Error details:", err);
    }
}

testSpellCheck();
