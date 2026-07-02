const express = require('express');
const router = express.Router();
const { checkSymptoms } = require('../controllers/aiController');

// 🌐 POST /api/ai/symptom-check - Analyze symptoms and recommend doctors
router.post('/symptom-check', checkSymptoms);

module.exports = router;
