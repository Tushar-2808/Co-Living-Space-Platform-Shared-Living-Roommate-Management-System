const User = require('../models/User.model');

// GET /api/users/profile
const getProfile = (req, res) => {
    res.json({ success: true, user: req.user });
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
    const { name, phone, bio, profilePic } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, bio, profilePic },
        { new: true, runValidators: true }
    );
    res.json({ success: true, user });
};

// PUT /api/users/lifestyle
const updateLifestyle = async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { lifestyleProfile: req.body, lifestyleCompleted: true },
        { new: true, runValidators: true }
    );
    res.json({ success: true, user });
};

// GET /api/users/:id  (public — for viewing another user's profile)
const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('name bio profilePic lifestyleProfile lifestyleCompleted isVerified role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
};

module.exports = { getProfile, updateProfile, updateLifestyle, getUserById };
