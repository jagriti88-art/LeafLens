const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const FormData = require('form-data');
const User = require('../models/userModel'); 

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const diagnosePlant = async (req, res) => {
    try {
        // --- 1. VALIDATION ---
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        // --- 2. FORWARD IMAGE TO PYTHON AI ENGINE ---
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const pythonAiUrl = process.env.PYTHON_AI_URL || "http://localhost:8000/predict";

        console.log("📤 Sending image to AI Engine...");
        
        const aiRes = await axios.post(pythonAiUrl, form, {
            headers: { ...form.getHeaders() },
            timeout: 60000 // Increased to 60s for cold starts
        });

        const { disease, confidence } = aiRes.data;
        console.log(`✅ AI Engine Result: ${disease} (${confidence})`);

        // --- 3. GET TREATMENT FROM GEMINI ---
        // Using gemini-pro which is available on v1beta API
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are an expert plant pathologist. 
            A plant has been diagnosed with "${disease}".
            The detection confidence is ${ (confidence * 100).toFixed(2) }%.
            
            Provide a professional but easy-to-understand response for a home gardener:
            1. A brief explanation of what "${disease}" is.
            2. A 3-step organic treatment plan.
            3. One prevention tip to avoid this in the future.
            
            Format the response with clear headings and bullet points.
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response; // Ensure response is awaited
        const treatmentText = response.text();

        // Prepare the data object
        const cleanDiseaseName = disease.replace(/___/g, ' ').replace(/_/g, ' ');
        const diagnosisData = {
            disease: cleanDiseaseName,
            confidence: (confidence * 100).toFixed(2) + "%",
            treatment: treatmentText,
            createdAt: new Date()
        };

        // --- 4. UPDATE MONGODB HISTORY ---
        if (req.user) {
            // Use req.user._id or req.user depending on how your protect middleware is written
            const userId = req.user._id || req.user;
            await User.findByIdAndUpdate(
                userId, 
                { $push: { history: diagnosisData } },
                { new: true }
            );
            console.log(`💾 Diagnosis saved to history for user: ${userId}`);
        } else {
            console.warn("⚠️ User not authenticated; skipping history save.");
        }

        // --- 5. RETURN RESPONSE TO FRONTEND ---
        res.json({
            success: true,
            ...diagnosisData
        });

    } catch (error) {
        console.error("❌ Diagnosis Error Details:", error.message);
        
        if (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: "AI Engine Offline", 
                details: "The Python AI engine is currently waking up or offline." 
            });
        }

        res.status(500).json({ 
            error: "Diagnosis Engine Error", 
            details: error.message 
        });
    }
};

module.exports = { diagnosePlant };