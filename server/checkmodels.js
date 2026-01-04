const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAvailableModels() {
    try {
        // In the latest SDK, listModels is an async generator or a direct method
        const result = await genAI.listModels();
        
        console.log("--- Available Models for your API Key ---");
        result.models.forEach((m) => {
            console.log(`Model ID: ${m.name}`);
            console.log(`Methods: ${m.supportedGenerationMethods.join(", ")}`);
            console.log("---------------------------------------");
        });
    } catch (error) {
        console.error("Could not list models. Check your API key:", error.message);
    }
}

listAvailableModels();