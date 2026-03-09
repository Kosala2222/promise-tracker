// backend/controllers/JournalistController.js
const Promise = require('../../models/politician/Promise');
const User = require('../../models/User'); 
const PoliticianProfile = require('../../models/politician/PoliticianProfile'); 
const JournalistProfile = require('../../models/journalist/journalistProfile');

// @desc    Get aggregated performance data for all politicians (Dashboard/Reports)
// @route   GET /api/journalist/performance
exports.getPerformanceDashboardData = async (req, res) => {
    try {
        // --- 1. Aggregate Promise Metrics (Count statuses) ---
        const promiseMetrics = await Promise.aggregate([
            {
                $group: {
                    _id: "$politician", // Group by politician ID
                    totalPromises: { $sum: 1 },
                    fulfilled: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    broken: { $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                }
            },
            {
                $addFields: {
                    // Calculate Success Rate for reporting
                    successRate: {
                        $round: [
                            { 
                                $multiply: [
                                    { $divide: ["$fulfilled", "$totalPromises"] }, 
                                    100
                                ] 
                            }, 
                            1 // Round to 1 decimal place
                        ]
                    }
                }
            }
        ]);

        // --- 2. Get Politician User and Profile Details ---
        // Extract politician IDs from metrics
        const politicianIds = promiseMetrics.map(m => m._id); // These are PoliticianProfile._id values

        const politicianDetails = await PoliticianProfile.find({ _id: { $in: politicianIds } })
            .populate('user', 'username email'); // Populate basic User info

        // --- 3. Combine Data and Format Output ---
        const dashboardData = promiseMetrics.map(metric => {
            const profile = politicianDetails.find(p => p._id.equals(metric._id));
            return {
                politicianId: metric._id,
                username: profile?.user.username || 'N/A',
                party: profile?.party || 'N/A',
                position: profile?.position || 'N/A',
                isVerified: profile?.isVerified || false,
                metrics: {
                    totalPromises: metric.totalPromises,
                    fulfilled: metric.fulfilled,
                    broken: metric.broken,
                    inProgress: metric.inProgress,
                    pending: metric.pending,
                    successRate: metric.successRate, // Main metric for comparison
                }
            };
        });

        res.status(200).json(dashboardData);
    } catch (error) {
        console.error("Journalist Performance Data Error:", error);
        res.status(500).json({ message: 'Server error fetching performance data.' });
    }
};

// @desc    Get all verified evidence for a specific promise
// @route   GET /api/journalist/promise/:promiseId/verified-evidence
// NOTE: Journalists need access to the verified, public evidence
exports.getVerifiedEvidenceForPromise = async (req, res) => {
    try {
        const evidence = await require('../../models/citizen/Evidence').find({ 
            promise: req.params.promiseId,
            status: 'approved' // ONLY approved evidence is public/for journalist reports
        })
        .populate('submittedBy', 'username') // Show who submitted the fact-check
        .sort({ createdAt: -1 });

        res.status(200).json(evidence);
    } catch (error) {
        console.error("Journalist Verified Evidence Error:", error);
        res.status(500).json({ message: 'Server error fetching verified evidence.' });
    }
};

// @desc    Get aggregate summary of citizen evidence counts by status (journalist oversight)
// @route   GET /api/journalist/evidence/summary
exports.getEvidenceSummary = async (req, res) => {
    try {
        const Evidence = require('../../models/citizen/Evidence');
        const total = await Evidence.countDocuments({});

        // Read allowed statuses from the model enum to avoid hardcoding
        const statusPath = Evidence.schema.path('status');
        const enumStatuses = Array.isArray(statusPath?.enumValues) ? statusPath.enumValues : [];

        // Count documents for each status dynamically
        const counts = {};
        for (const st of enumStatuses) {
            counts[st] = await Evidence.countDocuments({ status: st });
        }

        // Maintain backward compatible fields if present
        const approved = counts.approved || 0;
        const rejected = counts.rejected || 0;
        const pending = counts.pending || 0;

        res.status(200).json({ total, approved, rejected, pending, counts });
    } catch (error) {
        console.error('Journalist Evidence Summary Error:', error);
        res.status(500).json({ message: 'Server error fetching evidence summary.' });
    }
};

// --- Journalist Profile Helpers & Endpoints ---
const getJournalistProfile = async (userId) => {
    let profile = await JournalistProfile.findOne({ user: userId });
    if (!profile) {
        profile = await JournalistProfile.create({ user: userId });
    }
    return profile;
};

// @desc    Get the profile of the logged-in journalist
// @route   GET /api/journalist/profile
exports.getProfile = async (req, res) => {
    try {
        const profile = await getJournalistProfile(req.user.id);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching journalist profile.' });
    }
};

// @desc    Update journalist profile (organization, bio, preferences, yearsOfExperience)
// @route   POST /api/journalist/profile
exports.updateProfile = async (req, res) => {
    try {
        const { organization, bio, preferences, yearsOfExperience } = req.body;
        let profile = await getJournalistProfile(req.user.id);

        if (typeof organization === 'string') profile.organization = organization;
        if (typeof bio === 'string') profile.bio = bio;
        if (Array.isArray(preferences)) profile.preferences = preferences.map(String);
        if (yearsOfExperience !== undefined) {
            const y = Number(yearsOfExperience);
            profile.yearsOfExperience = Number.isFinite(y) && y >= 0 ? y : 0;
        }

        await profile.save();
        return res.json({ message: 'Journalist profile updated successfully.', profile });
    } catch (error) {
        console.error('Journalist Update Profile Error:', error);
        res.status(500).json({ message: 'Server error updating journalist profile.' });
    }
};

// @desc    Upload and set profile photo for the logged-in journalist
// @route   POST /api/journalist/profile/photo
exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const relativePath = `/uploads/profilePhotos/${req.file.filename}`;

        let profile = await getJournalistProfile(req.user.id);
        profile.profilePhotoUrl = relativePath;
        await profile.save();

        return res.status(200).json({ message: 'Profile photo updated successfully.', profilePhotoUrl: relativePath, profile });
    } catch (error) {
        console.error('Journalist Upload Profile Photo Error:', error);
        return res.status(500).json({ message: 'Server error uploading profile photo.' });
    }
};