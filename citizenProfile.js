// backend/controllers/NgoController.js
const Promise = require('../../models/politician/Promise');
const Evidence = require('../../models/citizen/Evidence');
const User = require('../../models/User'); // For populating politician details
const PoliticianProfile = require('../../models/politician/PoliticianProfile'); // For populating politician profile

// Helper function to aggregate Promise data
const aggregatePromises = async (query = {}) => {
    // Pipeline to join Promise, Politician User, and Politician Profile data
    const pipeline = [
        { $match: query },
        { 
            $lookup: {
                from: 'users', // The name of the User collection
                localField: 'politician',
                foreignField: '_id',
                as: 'politicianUser'
            }
        },
        { $unwind: '$politicianUser' }, // Deconstruct the politicianUser array
        { 
            $lookup: {
                from: 'politicianprofiles', // The name of the PoliticianProfile collection
                localField: 'politician',
                foreignField: 'user',
                as: 'politicianProfile'
            }
        },
        { $unwind: { path: '$politicianProfile', preserveNullAndEmptyArrays: true } },
        { 
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                dueDate: 1,
                status: 1,
                sourceUrl: 1,
                createdAt: 1,
                // Combine details for easy access on the frontend
                politicianDetails: {
                    username: '$politicianUser.username',
                    email: '$politicianUser.email',
                    party: '$politicianProfile.party',
                    position: '$politicianProfile.position',
                    profileId: '$politicianProfile._id',
                }
            }
        },
        { $sort: { createdAt: -1 } }
    ];
    return Promise.aggregate(pipeline);
};

// @desc    NGO verifies a politician profile (sets isVerified=true)
// @route   PUT /api/ngo/politicians/:politicianId/verify
exports.verifyPolitician = async (req, res) => {
    try {
        const { politicianId } = req.params; // this is the User._id of the politician
        const profile = await PoliticianProfile.findOne({ user: politicianId });
        if (!profile) {
            return res.status(404).json({ message: 'Politician profile not found.' });
        }
        profile.isVerified = true;
        await profile.save();
        return res.status(200).json({ message: 'Politician verified successfully.', profile });
    } catch (error) {
        console.error('NGO Verify Politician Error:', error);
        return res.status(400).json({ message: error.message || 'Error verifying politician.' });
    }
};


// @desc    Get all promises for NGO moderation dashboard
// @route   GET /api/ngo/promises
exports.getAllPromisesForModeration = async (req, res) => {
    try {
        const promises = await aggregatePromises({});
        res.status(200).json(promises);
    } catch (error) {
        console.error("NGO Get Promises Error:", error);
        res.status(500).json({ message: 'Server error fetching promises for moderation.' });
    }
};

// @desc    NGO updates promise status and details (Description, Date, Source)
// @route   PUT /api/ngo/promises/:promiseId
exports.updatePromiseByNgo = async (req, res) => {
    const { status, description, dueDate, sourceUrl } = req.body;
    const promiseId = req.params.promiseId;
    const moderatorId = req.user.id; // The logged-in NGO user

    try {
        const promise = await Promise.findById(promiseId);

        if (!promise) {
            return res.status(404).json({ message: 'Promise not found.' });
        }
        
        // 1. Update Promise details (can be edited by NGO)
        promise.description = description ?? promise.description;
        promise.dueDate = dueDate ?? promise.dueDate;
        promise.sourceUrl = sourceUrl ?? promise.sourceUrl;

        // 2. Update Status (Moderation)
        if (status && Promise.schema.path('status').enumValues.includes(status)) {
            promise.status = status;
            promise.lastModeratedBy = moderatorId;
        }

        const updatedPromise = await promise.save();

        res.status(200).json({ 
            message: 'Promise status and details updated successfully.', 
            promise: updatedPromise 
        });
    } catch (error) {
        console.error("NGO Update Promise Error:", error);
        res.status(400).json({ message: error.message || 'Error updating promise.' });
    }
};

// @desc    Get evidence submitted for a specific promise
// @route   GET /api/ngo/evidence/:promiseId
exports.getEvidenceForModeration = async (req, res) => {
    try {
        const evidence = await Evidence.find({ promise: req.params.promiseId })
            .populate('submittedBy', 'username email') // Populate citizen submitter info
            .sort({ createdAt: -1 });

        res.status(200).json(evidence);
    } catch (error) {
        console.error("NGO Get Evidence Error:", error);
        res.status(500).json({ message: 'Server error fetching evidence.' });
    }
};

// @desc    NGO verifies (approves/rejects) citizen evidence
// @route   PUT /api/ngo/evidence/:evidenceId/verify
exports.verifyEvidence = async (req, res) => {
    const { status } = req.body; // expected: 'approved' | 'rejected'
    const evidenceId = req.params.evidenceId;

    try {
        const evidence = await Evidence.findById(evidenceId);

        if (!evidence) {
            return res.status(404).json({ message: 'Evidence not found.' });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'." });
        }

        evidence.status = status;
        await evidence.save();

        const message = status === 'approved'
            ? 'Evidence successfully approved.'
            : 'Evidence successfully rejected.';

        res.status(200).json({ message, evidence });
    } catch (error) {
        console.error("NGO Verify Evidence Error:", error);
        res.status(400).json({ message: error.message || 'Error verifying evidence.' });
    }
};