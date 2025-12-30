require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');

// Import Controllers & Middleware
const { diagnosePlant } = require('./controllers/plantcontroller');
const { registerUser, loginUser } = require('./controllers/authController');
const { protect } = require('./middleware/authMiddleware');
const { 
    getDashboardSummary, 
    getRecentActivity, 
    getDiagnosisDetails 
} = require('./controllers/dashboardController');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Essential for parsing login/register data

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); 
    });

// --- Public Auth Routes ---
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// --- Protected Diagnosis Route ---
// This handles the image upload from your 'diagnosePlant' Axios call
app.post('/api/diagnose', protect, upload.single('image'), diagnosePlant);

// --- Protected Dashboard Routes ---
app.get('/api/dashboard/summary', protect, getDashboardSummary);
app.get('/api/dashboard/history', protect, getRecentActivity);
app.get('/api/dashboard/details/:id', protect, getDiagnosisDetails);

// --- Debugging/Health Check Route ---
// If you see "Cannot GET /api/auth/register", visit this URL in your browser.
// If this works, your server is fine, but your Auth form is sending the wrong method.
app.get('/api/test', (req, res) => {
    res.json({ message: "LeafLens API is reachable!" });
});

// --- Global Error Handling ---
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).json({ 
        message: err.message || 'Something went wrong on the server' 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 LeafLens Backend running on http://localhost:${PORT}`);
});