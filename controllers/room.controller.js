const Room = require('../models/Room.model');
const Property = require('../models/Property.model');
const { calculateCompatibility, getScoreTier } = require('../services/matching.service');

// GET /api/rooms/:id
const getRoomById = async (req, res) => {
    const room = await Room.findById(req.params.id)
        .populate('property')
        .populate('currentTenants', 'name profilePic lifestyleProfile isVerified');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    res.json({ success: true, room });
};

// POST /api/properties/:propertyId/rooms  (owner only)
const createRoom = async (req, res) => {
    const property = await Property.findOne({ _id: req.params.propertyId, owner: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found or not yours.' });
    const room = await Room.create({ ...req.body, property: property._id });
    res.status(201).json({ success: true, room });
};

// PUT /api/rooms/:id  (owner only)
const updateRoom = async (req, res) => {
    const room = await Room.findById(req.params.id).populate('property');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    if (String(room.property.owner) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    Object.assign(room, req.body);
    await room.save();
    res.json({ success: true, room });
};

// DELETE /api/rooms/:id  (owner only)
const deleteRoom = async (req, res) => {
    const room = await Room.findById(req.params.id).populate('property');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    if (String(room.property.owner) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    room.isActive = false;
    await room.save();
    res.json({ success: true, message: 'Room deactivated.' });
};

// GET /api/rooms/:id/compatibility  (tenant — check their score vs this room)
const getRoomCompatibility = async (req, res) => {
    const room = await Room.findById(req.params.id).populate('currentTenants', 'lifestyleProfile');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    if (!req.user.lifestyleCompleted) {
        return res.status(400).json({ success: false, message: 'Please complete your lifestyle quiz first.' });
    }
    const { score, breakdown } = calculateCompatibility(req.user.lifestyleProfile, room.currentTenants);
    const tier = getScoreTier(score);
    res.json({ success: true, score, tier, breakdown });
};

module.exports = { getRoomById, createRoom, updateRoom, deleteRoom, getRoomCompatibility };
