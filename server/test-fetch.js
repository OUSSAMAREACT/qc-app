const key = "AIzaSyAjrNsQRv7ZXntMsIA__JqBM3oNZsJshvg";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function test() {
    console.log("Testing URL:", url);
    try {
        const response = await fetch(url);

        console.log("Status:", response.status);
        const data = await response.json();
        if (data.models) {
            const geminiModels = data.models.map(m => m.name).filter(n => n.includes('gemini'));
            console.log("Gemini Models:\n" + geminiModels.join('\n'));
        } else {
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
