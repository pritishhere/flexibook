const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_super_secret_key';

// ==========================================================
// 1. Core Authentication Guard (Verifies JWT and Attaches User)
// ==========================================================
/**
 * Protects routes from unauthenticated users by verifying the Bearer Token.
 * Attaches the authenticated user object to the request (`req.user`).
 */
const protect = async (req, res, next) => {
    let token;

    // Check if the authorization header is properly structured with a Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token string by splitting "Bearer <TOKEN>"
            token = req.headers.authorization.split(' ')[1];

            // Verify the cryptographic signature of the token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Fetch the user from MongoDB using the ID from the token payload (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Authorization failed. User no longer exists.' });
            }

            // Authentication successful, hand over to the next route/controller handler
            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token validation failed.' });
        }
    }

    // Edge case if no token configuration was found in the header
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No authorization token provided.' });
    }
};

// ==========================================================
// 2. Role-Based Authorization Filter (RBAC)
// ==========================================================
/**
 * Restricts route access to specific account roles (e.g., 'admin', 'doctor', 'patient').
 * MUST be placed sequentially AFTER the 'protect' middleware in your routes.
 * @param {...String} roles - Allowed roles for the target route
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Fallback safety check if 'protect' wasn't bound before this function call
        if (!req.user) {
            return res.status(500).json({ success: false, message: 'Authorization middleware sequence error.' });
        }

        // Match user's role against the array of acceptable roles passed to the route
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Forbidden Access: Role '${req.user.role}' is unauthorized to access this resource.` 
            });
        }

        next();
    };
};

module.exports = { protect, authorize };