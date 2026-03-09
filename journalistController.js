// backend/controllers/PromiseController.js
const Promise = require('../models/politician/Promise');
const PoliticianProfile = require('../models/politician/PoliticianProfile');

// @desc    Get all promises for a specific politician (Public Read)
// @route   GET /api/promises/politician/:politicianId
exports.getPublicPromisesByPolitician = async (req, res) => {
    try {
        const promises = await Promise.find({ politician: req.params.politicianId })
            .populate('politician', 'username')
            .sort({ createdAt: -1 });

        const profile = await PoliticianProfile.findOne({ user: req.params.politicianId });
        const photoUrl = profile?.profilePhotoUrl || null;

        const result = promises.map(p => ({
            ...p.toObject(),
            politicianPhotoUrl: photoUrl,
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching promises.' });
    }
};

// @desc    Get all promises globally (Public Read)
// @route   GET /api/promises/all
exports.getAllPromises = async (req, res) => {
    try {
        const promises = await Promise.find({})
            .populate('politician', 'username')
            .sort({ createdAt: -1 });

        const uniquePoliticianIds = [...new Set(promises.map(p => p.politician?._id?.toString()).filter(Boolean))];
        const profiles = await PoliticianProfile.find({ user: { $in: uniquePoliticianIds } });
        const photoMap = new Map(profiles.map(pr => [pr.user.toString(), pr.profilePhotoUrl]));

        const result = promises.map(p => ({
            ...p.toObject(),
            politicianPhotoUrl: p.politician?._id ? (photoMap.get(p.politician._id.toString()) || null) : null,
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching all promises.' });
    }
};
