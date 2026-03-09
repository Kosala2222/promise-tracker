const mongoose = require('mongoose');

// This model stores the citizen's personal data relevant to the application (interests, follows)
const CitizenProfileSchema = new mongoose.Schema({
    // Link to the main User document
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // One profile per citizen user
    },
    // Citizen's areas of interest (e.g., 'Education', 'Health')
    interests: [{
        type: String,
        trim: true,
    }],
    // CRITICAL: List of politicians the citizen is actively following (User IDs of politicians)
    followedPoliticians: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    }],
    profilePhotoUrl: {
        type: String,
        default: 'default_avatar.png',
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('CitizenProfile', CitizenProfileSchema);
