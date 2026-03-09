// backend/controllers/ngo/ngoProfileController.js
const path = require('path');
const NgoProfile = require('../../models/ngo/NgoProfile');

// GET /api/ngo/profile/me
const getMyProfile = async (req, res) => {
  try {
    const profile = await NgoProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(200).json(null);
    return res.json(profile);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// PUT /api/ngo/profile (create or update)
const upsertProfile = async (req, res) => {
  try {
    const data = {
      organization: req.body.organization,
      position: req.body.position,
      experience: req.body.experience,
      bio: req.body.bio,
      nic: req.body.nic,
      organizationContactNo: req.body.organizationContactNo,
      organizationEmail: req.body.organizationEmail,
    };

    const updated = await NgoProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: data, $setOnInsert: { user: req.user._id } },
      { upsert: true, new: true }
    );
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to save profile' });
  }
};

// POST /api/ngo/profile/photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const relative = `/uploads/profilePhotos/${req.file.filename}`;
    const updated = await NgoProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { profilePhotoUrl: relative }, $setOnInsert: { user: req.user._id } },
      { upsert: true, new: true }
    );
    return res.json({ profilePhotoUrl: relative, profile: updated });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to upload photo' });
  }
};

module.exports = { getMyProfile, upsertProfile, uploadProfilePhoto };
