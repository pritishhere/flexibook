const User = require('../models/User');
const jwt = require('jsonwebtoken'); // To create digital ID cards for logged-in users

// Helper function to generate a JWT token
const generateToken = (id) => {
    // This creates a secure token valid for 30 days
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', 
    });
};

// @desc    Register a new user (Patient or Business)
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check if user already exists in the database
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // 2. Create the new user (Password will be auto-hashed by our User model hook)
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        // 3. If user is created successfully, send data and token back to frontend
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// @desc    Login existing user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by their email
        const user = await User.findOne({ email });

        // 2. Check if user exists AND if the entered password matches the database
        if (user && (await user.comparePassword(password))) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};