// 

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the four specific roles for your application
const VALID_ROLES = ['politician', 'citizen', 'ngo', 'journalist', 'admin'];

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    // The critical field for Role-Based Access Control (RBAC)
    role: {
        type: String,
        enum: VALID_ROLES, // Ensures only these four roles can be assigned
        default: 'citizen', // Default role for public signups
        required: true,
    },
}, { 
    timestamps: true // Adds createdAt and updatedAt fields
});

// Middleware to hash the password before saving the user document
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare the entered password with the hashed password in the database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
