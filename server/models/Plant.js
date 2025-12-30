const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    disease: {
        type: String,
        required: true
    },
    confidence: {
        type: String,
        required: true
    },
    treatment: {
        type: String,
        required: true
    },
    imageName: {
        type: String, // This will store the Cloudinary URL or file path
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Plant', plantSchema);