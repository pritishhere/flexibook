const express = require('express');
const router = express.Router();
const { handleIncomingWhatsAppMessage } = require('../controllers/voiceQueueController');

// 🌐 POST /api/voice-queue/whatsapp - Twilio Webhook Receiver for incoming messages/voice notes
router.post('/whatsapp', handleIncomingWhatsAppMessage);

module.exports = router;
