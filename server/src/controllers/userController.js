const User = require('../models/user');
const FamilyMember = require('../models/FamilyMember');

// @desc    Update user profile
// @route   PUT /api/user/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add family member
// @route   POST /api/user/family
exports.addFamilyMember = async (req, res) => {
  const { name, relationship, age, gender } = req.body;
  try {
    const member = await FamilyMember.create({
      userId: req.user._id,
      name,
      relationship,
      age,
      gender,
    });
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all family members for logged-in user
// @route   GET /api/user/family
exports.getFamilyMembers = async (req, res) => {
  try {
    const members = await FamilyMember.find({ userId: req.user._id });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};