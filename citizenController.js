// backend/controllers/EvidenceController.js
const Evidence = require('../models/citizen/Evidence');
const Promise = require('../models/politician/Promise'); 

// @desc    Submit new evidence/comment on a promise
// @route   POST /api/promises/evidence/:promiseId
exports.submitEvidence = async (req, res) => {
    const { promiseId } = req.params;
    const { comment, linkUrl, type } = req.body;
    const citizenId = req.user.id; 

    if (!comment) {
        return res.status(400).json({ message: 'Comment is required for evidence.' });
    }

    try {
        const promiseExists = await Promise.findById(promiseId);
        if (!promiseExists) {
            return res.status(404).json({ message: 'Promise not found.' });
        }

        let photoUrl = null;
        let pdfUrl = null;
        if (req.files) {
            if (req.files.photo && req.files.photo[0]) {
                photoUrl = `/uploads/evidence/${req.files.photo[0].filename}`;
            }
            if (req.files.pdf && req.files.pdf[0]) {
                pdfUrl = `/uploads/evidence/${req.files.pdf[0].filename}`;
            }
        }
        
        const newEvidence = new Evidence({
            promise: promiseId,
            submittedBy: citizenId,
            comment,
            linkUrl,
            type: type || 'neutral',
            photoUrl,
            pdfUrl,
        });

        await newEvidence.save();

        res.status(201).json({ 
            message: 'Evidence submitted successfully! It is pending review.', 
            evidence: newEvidence 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during evidence submission.' });
    }
};

// @desc    Get all evidence for a specific promise
// @route   GET /api/promises/evidence/:promiseId
exports.getEvidenceForPromise = async (req, res) => {
    try {
        // Fetch evidence and populate the submitter's username
        const evidence = await Evidence.find({ promise: req.params.promiseId })
            .populate('submittedBy', 'username') 
            .sort({ createdAt: -1 });

        res.json(evidence);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching evidence.' });
    }
};
