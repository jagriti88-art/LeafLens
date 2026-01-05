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

// --- 1. Production CORS Configuration ---
const allowedOrigins = [
    'http://localhost:5173',               // Vite Local
    'https://leaf-lens-delta.vercel.app'   // Your Vercel Frontend
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS Policy'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

// --- CRITICAL FIX FOR EXPRESS 5 ---
// Named wildcard '/*any' prevents the PathError crash on preflight
app.options('/*any', cors()); 

app.use(express.json());

// --- 2. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
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

// --- 6. Health Checks & Base Routes ---
app.get('/', (req, res) => {
    res.send('🌿 LeafLens Node.js Backend is LIVE 🚀');
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
    console.error('Detailed Error:', err.stack);
    res.status(err.status || 500).json({ 
        success: false,
        message: err.message || 'Internal Server Error' 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server active on port ${PORT}`);
});