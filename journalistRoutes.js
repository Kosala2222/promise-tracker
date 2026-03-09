const mongoose = require('mongoose');

// This model handles citizen-submitted feedback/evidence on a specific promise
const EvidenceSchema = new mongoose.Schema({
    // Reference to the promise being commented on
    promise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promise',
        required: true,
    },
    // The Citizen who submitted the evidence
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    // Citizen's comment/description
    comment: {
        type: String,
        maxlength: 500,
        required: [true, 'A comment is required for evidence submission.'],
    },
    // Optional link to external source
    linkUrl: {
        type: String,
        trim: true,
        required: false,
    },
    // Optional uploaded image path (served via /uploads)
    photoUrl: {
        type: String,
        required: false,
    },
    // Optional uploaded PDF path (served via /uploads)
    pdfUrl: {
        type: String,
        required: false,
    },
    // Type of feedback: does it support or contradict the promise's status?
    type: {
        type: String,
        enum: ['support', 'contradict', 'neutral'],
        default: 'neutral',
    },
    // Moderation status set by NGO
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Evidence', EvidenceSchema);