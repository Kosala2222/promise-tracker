//journalist

const mongoose = require('mongoose');

const JournalistProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  profilePhotoUrl: { type: String, default: null },
  organization: { type: String, default: '' },
  bio: { type: String, default: '' },
  preferences: { type: [String], default: [] },
  yearsOfExperience: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('JournalistProfile', JournalistProfileSchema);