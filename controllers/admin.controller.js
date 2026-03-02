const User = require('../models/User.model');
const Property = require('../models/Property.model');
const Application = require('../models/Application.model');
const Room = require('../models/Room.model');

// GET /api/admin/stats
const getStats = async (req, res) => {
    const [users, properties, rooms, applications] = await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        Property.countDocuments(),
        Room.countDocuments(),
        Application.countDocuments(),
    ]);
    const approvedApps = await Application.countDocuments({ status: 'approved' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const verifiedProps = await Property.countDocuments({ isVerified: true });
    res.json({
        success: true,
        stats: { users, properties, rooms, applications, approvedApps, verifiedUsers, verifiedProps },
    });
};

// GET /api/admin/users?role=&verified=
const getUsers = async (req, res) => {
    const { role, verified, page = 1, limit = 20 } = req.query;
    const filter = { role: { $ne: 'admin' } };
    if (role) filter.role = role;
    if (verified !== undefined) filter.isVerified = verified === 'true';
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
        User.find(filter).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
        User.countDocuments(filter),
    ]);
    res.json({ success: true, users, total });
};

// PUT /api/admin/users/:id/verify
const verifyUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
};

// PUT /api/admin/users/:id/deactivate
const deactivateUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
};

// GET /api/admin/properties?verified=
const adminGetProperties = async (req, res) => {
    const { verified, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (verified !== undefined) filter.isVerified = verified === 'true';
    const skip = (Number(page) - 1) * Number(limit);
    const [properties, total] = await Promise.all([
        Property.find(filter).populate('owner', 'name email').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
        Property.countDocuments(filter),
    ]);
    res.json({ success: true, properties, total });
};

// PUT /api/admin/properties/:id/verify
const verifyProperty = async (req, res) => {
    const property = await Property.findByIdAndUpdate(
        req.params.id,
        { isVerified: req.body.isVerified !== false },
        { new: true }
    );
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });
    res.json({ success: true, property });
};

module.exports = { getStats, getUsers, verifyUser, deactivateUser, adminGetProperties, verifyProperty };
