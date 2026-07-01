// In-memory data store singleton
// Used as a fallback when MongoDB is not connected

const inMemoryDb = {
    hospitals: [],
    departments: [],
    services: []
};

module.exports = inMemoryDb;
