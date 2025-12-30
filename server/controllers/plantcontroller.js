const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const FormData = require('form-data');
const User = require('../models/userModel'); 

// 1. Initialize Gemini with Stable 2025 Settings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const diagnosePlant = async (req, res) => {
    try {
        // Basic Check
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        // --- 2. FORWARD IMAGE TO PYTHON AI ENGINE ---
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        if (!process.env.PYTHON_AI_URL) {
            throw new Error("PYTHON_AI_URL is missing in .env");
        }

        // This defines 'aiRes' so the rest of the code can use it
        const aiRes = await axios.post(process.env.PYTHON_AI_URL, form, {
            headers: { ...form.getHeaders() }
        });

        // Now aiRes.data exists!
        const { disease, confidence } = aiRes.data;

        // --- 3. GET TREATMENT FROM GEMINI ---
        const model = genAI.getGenerativeModel(
            { model: "gemini-2.5-flash" },
            { apiVersion: 'v1' }
        );

        const prompt = `The plant has been diagnosed with "${disease}". Provide a concise 3-step organic treatment plan for a home gardener.`;
        
        const result = await model.generateContent(prompt);
        const treatmentText = result.response.text();

        const diagnosisData = {
            disease,
            confidence: (confidence * 100).toFixed(2) + "%",
            treatment: treatmentText,
            createdAt: new Date()
        };

        // --- 4. UPDATE MONGODB HISTORY ---
        // 'req.user' comes from your 'protect' middleware (decoded.id)
        if (req.user) {
            await User.findByIdAndUpdate(
                req.user, 
                { $push: { history: diagnosisData } },
                { new: true }
            );
            console.log(`✅ History saved for user: ${req.user}`);
        } else {
            console.warn("⚠️ No user ID found - history not saved.");
        }

        // --- 5. RETURN SUCCESS ---
        res.json({
            success: true,
            ...diagnosisData
        });

    } catch (error) {
        console.error("AI Error:", error.message);
        
        // Handle Axios specific errors (Python server down)
        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({ 
                error: "Python AI Engine is not running", 
                details: "Start your Python server on port 8000" 
            });
        }

        res.status(500).json({ 
            error: "Diagnosis Engine Error", 
            details: error.message 
        });
    }
};

module.exports = { diagnosePlant };