const jwt = require('jsonwebtoken');
const User = require('../models/user');
const inMemoryDb = require('../utils/inMemoryDb');

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

    // Check if authorization header is properly structured with a Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token string by splitting "Bearer <TOKEN>"
            token = req.headers.authorization.split(' ')[1];

            // Verify the cryptographic signature of the token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Fetch user from MongoDB or In-Memory fallback depending on connection state
            if (inMemoryDb.isDbConnected()) {
                req.user = await User.findById(decoded.id).select('-password');
            } else {
                const memUser = inMemoryDb.users.find(u => u._id === decoded.id);
                if (memUser) {
                    req.user = {
                        id: memUser._id,
                        _id: memUser._id,
                        name: memUser.name,
                        email: memUser.email,
                        role: memUser.role || 'patient'
                    };
                }
            }

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Authorization failed. User no longer exists.' });
            }

            // Authentication successful, hand over to next route/controller handler
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
// 2. Dynamic Role-Based Authorization Filter (RBAC)
// ==========================================================
/**
 * Restricts route access to specific account roles.
 * MUST be placed sequentially AFTER the 'protect' middleware in your routes.
 * 
 * Example usage: authorize('admin') or authorize('doctor', 'admin')
 * @param {...String} roles - Allowed roles for the target route
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Fallback safety check if 'protect' wasn't bound before this function call
        if (!req.user) {
            return res.status(500).json({ success: false, message: 'Authorization middleware sequence error.' });
        }

        const userRole = req.user.role;
        const isAuthorized = roles.includes(userRole);

        if (!isAuthorized) {
            return res.status(403).json({ 
                success: false, 
                message: `Forbidden Access: Role '${userRole}' is unauthorized to access this resource.` 
            });
        }

        next();
    };
};

// ==========================================================
// 3. Admin Dedicated Middleware
// ==========================================================
/**
 * Quick shortcut middleware specifically for protecting Master Dashboard endpoints.
 */
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(500).json({ success: false, message: 'Authorization middleware sequence error.' });
    }

    if (req.user.role === 'admin') {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Access denied: Requires Admin privileges for the Master Dashboard.'
    });
};

module.exports = { protect, authorize, adminOnly };