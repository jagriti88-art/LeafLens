const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const FormData = require('form-data');
const User = require('../models/userModel'); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const diagnosePlant = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image uploaded" });

        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // SANITIZE URL: Remove trailing slash to prevent 405 Method Not Allowed
        let pythonAiUrl = (process.env.PYTHON_AI_URL || "http://localhost:8000/predict").replace(/\/$/, "");

        console.log("📤 Forwarding to AI Engine...");
        const aiRes = await axios.post(pythonAiUrl, form, {
            headers: { ...form.getHeaders() },
            maxRedirects: 0, // Critical: prevent POST -> GET conversion
            timeout: 60000 
        });

        const { disease, confidence } = aiRes.data;

        // GEMINI 1.5 FLASH: Stable for v0.24.1 SDK
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `A plant has "${disease}". Give a brief explanation, 3 organic steps to cure it, and 1 prevention tip.`;
        
        const result = await model.generateContent(prompt);
        const treatmentText = result.response.text();

        const diagnosisData = {
            disease: disease.replace(/___/g, ' ').replace(/_/g, ' '),
            confidence: (confidence * 100).toFixed(2) + "%",
            treatment: treatmentText,
            createdAt: new Date()
        };

        if (req.user) {
            const userId = req.user._id || req.user;
            await User.findByIdAndUpdate(userId, { $push: { history: diagnosisData } });
        }

        res.json({ success: true, ...diagnosisData });

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Diagnosis Failed", details: error.message });
    }
};

module.exports = { diagnosePlant };