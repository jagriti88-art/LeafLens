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

// --- 1. Middleware & Production CORS ---
app.use(cors({
    origin: '*', // For hackathon ease; change to your Vercel URL later for security
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// --- 2. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        // Don't exit process in production; let Render try to restart
    });

// --- 3. Public Auth Routes ---
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// --- 4. Protected Diagnosis Route ---
app.post('/api/diagnose', protect, upload.single('image'), diagnosePlant);

// --- 5. Protected Dashboard Routes ---
app.get('/api/dashboard/summary', protect, getDashboardSummary);
app.get('/api/dashboard/history', protect, getRecentActivity);
app.get('/api/dashboard/details/:id', protect, getDiagnosisDetails);

// --- 6. Production Health Checks ---
// Root route so visiting https://leaflens-2qjk.onrender.com doesn't show "Cannot GET /"
app.get('/', (req, res) => {
    res.send('LeafLens Node.js Backend is LIVE 🚀');
});

app.get('/api/test', (req, res) => {
    res.json({ 
        message: "LeafLens API is reachable!",
        status: "Healthy",
        timestamp: new Date()
    });
});

// --- 7. Global Error Handling ---
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).json({ 
        message: err.message || 'Something went wrong on the server' 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 LeafLens Backend running on port ${PORT}`);
});