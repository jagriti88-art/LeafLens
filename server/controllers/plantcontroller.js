const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const FormData = require('form-data');
const User = require('../models/userModel'); 

// 1. Initialize Gemini
// Ensure GEMINI_API_KEY is in your Render Environment Variables
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

        // Your FastAPI URL on Render
        const pythonAiUrl = process.env.PYTHON_AI_URL || "https://leaflens-1-hxai.onrender.com/predict";

        console.log("📤 Sending image to AI Engine...");
        
        const aiRes = await axios.post(pythonAiUrl, form, {
            headers: { ...form.getHeaders() },
            timeout: 40000 // Extended timeout for heavy ML model loading
        });

        const { disease, confidence } = aiRes.data;
        console.log(`✅ AI Engine Result: ${disease} (${confidence})`);

        // --- 3. GET TREATMENT FROM GEMINI ---
        // Using gemini-1.5-flash for the best balance of speed and intelligence
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        const treatmentText = result.response.text();

        // Prepare the data object
        const diagnosisData = {
            disease: disease.replace(/___/g, ' ').replace(/_/g, ' '), // Cleans up labels like "Tomato___Early_blight"
            confidence: (confidence * 100).toFixed(2) + "%",
            treatment: treatmentText,
            createdAt: new Date()
        };

        // --- 4. UPDATE MONGODB HISTORY ---
        // req.user is populated by your protect middleware
        if (req.user) {
            await User.findByIdAndUpdate(
                req.user, 
                { $push: { history: diagnosisData } },
                { new: true }
            );
            console.log(`💾 Diagnosis saved to history for user: ${req.user}`);
        } else {
            console.warn("⚠️ User not authenticated; skipping history save.");
        }

        // --- 5. RETURN RESPONSE TO FRONTEND ---
        res.json({
            success: true,
            ...diagnosisData
        });

    } catch (error) {
        console.error("❌ Diagnosis Error Details:", error.response?.data || error.message);
        
        // Specific error handling for Python Engine
        if (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: "AI Engine Offline", 
                details: "The Python AI engine is currently waking up. Please try again in 30 seconds." 
            });
        }

        res.status(500).json({ 
            error: "Diagnosis Engine Error", 
            details: error.message 
        });
    }
};

module.exports = { diagnosePlant };