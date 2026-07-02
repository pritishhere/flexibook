const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken'); 
const inMemoryDb = require('../utils/inMemoryDb');

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d', 
    });
};

// @desc    Register a new user (Patient or Business)
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, mobile } = req.body;

        if (mongoose.connection.readyState === 1) {
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
                role,
                mobile
            });

            // 3. If user is created successfully, send data and token back to frontend
            if (user) {
                return res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                });
            }
        } else {
            // In-Memory Fallback
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Validation failed: name, email, and password are required' });
            }

            const userExists = inMemoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (userExists) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            // Hash password in-memory using bcryptjs
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = {
                _id: new mongoose.Types.ObjectId().toString(),
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: role || 'patient',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            inMemoryDb.users.push(newUser);

            return res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                token: generateToken(newUser._id)
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

        if (mongoose.connection.readyState === 1) {
            // 1. Find the user by their email
            const user = await User.findOne({ email });

            // 2. Check if user exists AND if the entered password matches the database
            if (user && (await user.comparePassword(password))) {
                return res.status(200).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                });
            } else {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
        } else {
            // In-Memory Fallback
            const user = inMemoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (user && (await bcrypt.compare(password, user.password))) {
                return res.status(200).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                });
            } else {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};