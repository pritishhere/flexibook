const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_fallback_secret_key', {
    expiresIn: '30s', // Edit to '30d' in production; 30 seconds for immediate testing
  });
};

module.exports = generateToken;