const mongoose = require('mongoose');

const whatsAppSessionSchema = new mongoose.Schema({
    whatsappNumber: {
        type: String,
        required: true,
        unique: true
    },
    step: {
        type: String,
        enum: ['awaiting_name', 'awaiting_dob'],
        required: true
    },
    tempData: {
        name: { type: String, default: '' }
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('WhatsAppSession', whatsAppSessionSchema);
