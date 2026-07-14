const mongoose = require('mongoose');

const dataStore = {
    hospitals: [],
    departments: [],
    services: [],
    doctors: [],
    reviews: [],
    users: [],
    familyMembers: [],
    transactions: [],
    complaints: [],
    appointments: [],
    whatsappSessions: []
};

// Returns true if mongoose is connected AND we are not overriding it to in-memory mode
const isDbConnected = () => {
    return mongoose.connection.readyState === 1 && process.env.USE_IN_MEMORY !== 'true';
};

module.exports = {
    ...dataStore,
    isDbConnected,
    rawDb: dataStore
};
