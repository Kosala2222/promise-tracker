// backend/controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (id, role) => {
    // Ensure role is a string before signing the token payload
    const safeRole = typeof role === 'string' ? role : 'citizen';
    return jwt.sign({ id, role: safeRole }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Helper function to create safe user data for response
const createUserResponse = (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role, // Mongoose ensures this is a string
});

// @desc 	Register a new user
// @route 	POST /api/auth/signup
const signup = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with that email already exists.' });
        }

        const user = await User.create({ username, email, password, role });

        if (user) {
            res.status(201).json({
                token: generateToken(user._id, user.role),
                user: createUserResponse(user),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data.' });
        }
    } catch (error) {
        console.error("Signup Error:", error);
        // Handle specific validation errors from Mongoose if necessary
        res.status(500).json({ message: 'Server error during signup.' });
    }
};

// @desc 	Authenticate user & get token
// @route 	POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.status(201).json({
                token: generateToken(user._id, user.role),
                user: createUserResponse(user),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = { signup, login };
