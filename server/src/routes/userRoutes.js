const express = require('express');
const router = express.Router();
const { updateUserProfile, addFamilyMember, getFamilyMembers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateUserProfile);
router.route('/family')
  .post(protect, addFamilyMember)
  .get(protect, getFamilyMembers);

module.exports = router;