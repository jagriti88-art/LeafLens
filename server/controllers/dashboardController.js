const User = require('../models/userModel');

// 1. Get Summary Stats AND Recent Activity
exports.getDashboardSummary = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const history = user.history || [];

        const summary = {
            totalScans: history.length,
            needsAttention: history.filter(p => !p.disease.toLowerCase().includes('healthy')).length,
            healthy: history.filter(p => p.disease.toLowerCase().includes('healthy')).length,
            categories: [...new Set(history.map(p => p.disease.split('___')[0]))],
            
            // Return newest first
            recentActivity: [...history]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10) 
        };

        res.json({ success: true, data: summary });
    } catch (err) {
        console.error("Dashboard Summary Error:", err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard summary' });
    }
};

// 2. Get Recent Activity (History List)
exports.getRecentActivity = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ message: "User not found" });

        const sortedHistory = user.history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ success: true, data: sortedHistory });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
};

// 3. Get Specific Diagnosis Details
exports.getDiagnosisDetails = async (req, res) => {
    try {
        // Find the user first
        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // DEBUG: Log the ID being searched
        console.log(`🔍 Searching for Report ID: ${req.params.id} in User: ${req.user}`);

        // Find the subdocument by ID inside the history array
        const report = user.history.id(req.params.id);

        if (!report) {
            console.log("❌ Report not found in array.");
            return res.status(404).json({ success: false, message: 'Report not found in database' });
        }

        console.log("✅ Report found successfully!");
        res.json({
            success: true,
            data: report
        });
    } catch (err) {
        console.error("Error fetching details:", err.message);
        res.status(500).json({ success: false, message: 'Error fetching report details' });
    }
};