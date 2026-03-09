// backend/controllers/politicianController.js

const Promise = require('../../models/politician/Promise');
const PoliticianProfile = require('../../models/politician/PoliticianProfile');

// @desc    Get the profile of the logged-in politician
// @route   GET /api/politician/profile
const getPoliticianProfile = async (req, res) => {

    try {
        const profile = await PoliticianProfile.findOne({ user: req.user._id }).populate('user', 'username email');

        if (!profile) {
            // If the user is a politician but hasn't created a profile yet
            return res.status(404).json({ message: 'Profile not found. Please create your profile.' });
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
};


// @desc    Create or update the profile of the logged-in politician
// @route   POST /api/politician/profile
const createOrUpdatePoliticianProfile = async (req, res) => {

    const { party, position, bio, profilePhotoUrl } = req.body;
    const profileFields = {
        user: req.user._id,
        party,
        position,
        bio,
        profilePhotoUrl,
    };

    try {
        let profile = await PoliticianProfile.findOne({ user: req.user._id });

        if (profile) {
            // Update existing profile
            profile = await PoliticianProfile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileFields },
                { new: true, runValidators: true }
            );
            res.status(200).json({ message: 'Profile updated successfully.', profile });
        } else {
            // Create new profile
            profile = await PoliticianProfile.create(profileFields);
            res.status(201).json({ message: 'Profile created successfully.', profile });
        }
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(400).json({ message: error.message || 'Error creating/updating profile.' });
    }
};

// @desc    Upload and set profile photo for the logged-in politician
// @route   POST /api/politician/profile/photo
const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const relativePath = `/uploads/profilePhotos/${req.file.filename}`;

        let profile = await PoliticianProfile.findOne({ user: req.user._id });
        if (!profile) {
            profile = await PoliticianProfile.create({
                user: req.user._id,
                party: '',
                position: '',
                bio: '',
                profilePhotoUrl: relativePath,
            });
        } else {
            profile.profilePhotoUrl = relativePath;
            await profile.save();
        }

        return res.status(200).json({ message: 'Profile photo updated successfully.', profilePhotoUrl: relativePath, profile });
    } catch (error) {
        console.error('Upload Profile Photo Error:', error);
        return res.status(500).json({ message: 'Server error uploading profile photo.' });
    }
};

// @desc    Create a new promise (optionally with photo)
// @route   POST /api/politician/promises
const createPromise = async (req, res) => {

    const { title, description, targetDate, sourceUrl } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required for a promise.' });
    }

    try {
        const dueDate = targetDate || undefined;
        const imageUrl = req.file ? `/uploads/promisePhotos/${req.file.filename}` : undefined;

        const promise = await Promise.create({
            politician: req.user._id,
            title,
            description,
            dueDate,
            sourceUrl,
            imageUrl,
            status: 'Pending',
        });

        res.status(201).json({ message: 'Promise created successfully.', promise });
    } catch (error) {
        console.error("Create Promise Error:", error);
        res.status(500).json({ message: 'Server error creating promise.' });
    }
};

// @desc    Get all promises by the logged-in politician
// @route   GET /api/politician/promises
const getMyPromises = async (req, res) => {
    try {
        const promises = await Promise.find({ politician: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(promises);
    } catch (error) {
        console.error("Get Promises Error:", error);
        res.status(500).json({ message: 'Server error fetching promises.' });
    }
};

module.exports = {
    getPoliticianProfile,
    createOrUpdatePoliticianProfile,
    uploadProfilePhoto,
    createPromise,
    getMyPromises,
};