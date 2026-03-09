// backend/controllers/CitizenController.js
const CitizenProfile = require('../../models/citizen/CitizenProfile');
const User = require('../../models/User'); 
const Evidence = require('../../models/citizen/Evidence');
const PoliticianProfile = require('../../models/politician/PoliticianProfile');

// Helper to initialize or fetch the citizen profile
const getCitizenProfile = async (userId) => {
    let profile = await CitizenProfile.findOne({ user: userId });
    if (!profile) {
        // Create an empty profile if none exists
        profile = await CitizenProfile.create({ user: userId });
    }
    return profile;
};

// @desc    Get achievements for the logged-in citizen based on evidence status
// @route   GET /api/citizen/achievements
exports.getAchievements = async (req, res) => {
    try {
        const citizenId = req.user.id;
        const evidenceList = await Evidence.find({ submittedBy: citizenId }).select('status comment createdAt');

        const approved = evidenceList.filter(e => e.status === 'approved').length;
        const rejected = evidenceList.filter(e => e.status === 'rejected').length;
        const pending = evidenceList.filter(e => e.status === 'pending').length;
        const totalPoints = approved * 50 - rejected * 30;

        res.status(200).json({
            approved,
            rejected,
            pending,
            totalSubmissions: evidenceList.length,
            totalPoints,
            items: evidenceList, // optionally return list for detail view
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching achievements.' });
    }
};

// @desc    Upload and set profile photo for the logged-in citizen
// @route   POST /api/citizen/profile/photo
exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const relativePath = `/uploads/profilePhotos/${req.file.filename}`;

        let profile = await getCitizenProfile(req.user.id);
        profile.profilePhotoUrl = relativePath;
        await profile.save();

        return res.status(200).json({ message: 'Profile photo updated successfully.', profilePhotoUrl: relativePath, profile });
    } catch (error) {
        console.error('Citizen Upload Profile Photo Error:', error);
        return res.status(500).json({ message: 'Server error uploading profile photo.' });
    }
};

// @desc    Get the profile of the logged-in citizen
// @route   GET /api/citizen/profile
exports.getProfile = async (req, res) => {
    try {
        const profile = await getCitizenProfile(req.user.id);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching citizen profile.' });
    }
};

// @desc    Update citizen profile (interests)
// @route   POST /api/citizen/profile
exports.updateProfile = async (req, res) => {
    const { interests } = req.body;
    try {
        let profile = await getCitizenProfile(req.user.id);
        profile.interests = interests || [];
        await profile.save();
        res.json({ message: 'Citizen profile updated successfully.', profile });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating citizen profile.' });
    }
};

// @desc    Fetches all politicians for the browse screen
// @route   GET /api/citizen/politicians
exports.getAllPoliticians = async (req, res) => {
    try {
        // Find all politician users and their profiles
        const politicianUsers = await User.find({ role: 'politician' }).select('_id username email');
        const profiles = await PoliticianProfile.find({ user: { $in: politicianUsers.map(u => u._id) } });
        
        const profileMap = new Map(profiles.map(p => [p.user.toString(), p]));

        // Combine user data with profile data
        const politicians = politicianUsers.map(user => {
            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                profile: profileMap.get(user._id.toString()) || null,
            };
        }).filter(p => p.profile); // Only show politicians who have created a profile

        res.json(politicians);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching politicians.' });
    }
};

// @desc    Follow or Unfollow a politician
// @route   POST /api/citizen/follow/:politicianId
exports.toggleFollow = async (req, res) => {
    const { politicianId } = req.params;
    const citizenId = req.user.id;

    if (citizenId === politicianId) {
        return res.status(400).json({ message: "You cannot follow yourself." });
    }

    try {
        let profile = await getCitizenProfile(citizenId);
        const isFollowing = profile.followedPoliticians.includes(politicianId);

        if (isFollowing) {
            profile.followedPoliticians.pull(politicianId);
            await profile.save();
            return res.json({ message: 'Unfollowed politician successfully.', following: false });
        } else {
            profile.followedPoliticians.push(politicianId);
            await profile.save();
            return res.json({ message: 'Followed politician successfully.', following: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error toggling follow status.' });
    }
};
