const Application = require('../models/Application.model');
const Room = require('../models/Room.model');
const Property = require('../models/Property.model');
const { calculateCompatibility, getScoreTier } = require('../services/matching.service');
const { createNotification } = require('./notification.controller');

// POST /api/applications  (tenant applies for a room)
const createApplication = async (req, res) => {
    const { roomId, message, moveInDate } = req.body;
    if (!roomId) return res.status(400).json({ success: false, message: 'roomId is required.' });

    if (!req.user.lifestyleCompleted) {
        return res.status(400).json({ success: false, message: 'Please complete your lifestyle quiz first.' });
    }

    const room = await Room.findById(roomId).populate('currentTenants', 'lifestyleProfile');
    if (!room || !room.isActive) return res.status(404).json({ success: false, message: 'Room not found.' });
    if (room.currentOccupancy >= room.capacity) {
        return res.status(400).json({ success: false, message: 'Room is at full capacity.' });
    }

    // Check for duplicate pending application
    const existing = await Application.findOne({ applicant: req.user._id, room: roomId, status: 'pending' });
    if (existing) return res.status(409).json({ success: false, message: 'You already have a pending application for this room.' });

    const { score, breakdown } = calculateCompatibility(req.user.lifestyleProfile, room.currentTenants);

    const application = await Application.create({
        applicant: req.user._id,
        room: roomId,
        property: room.property,
        message,
        moveInDate: moveInDate ? new Date(moveInDate) : undefined,
        compatibilityScore: score,
        compatibilityBreakdown: breakdown,
    });

    // Notify owner
    await createNotification(
        room.property.owner,
        'New Room Application',
        `${req.user.name} applied for Room ${room.roomNumber} in ${room.property.name}.`,
        'application_update',
        application._id
    );

    res.status(201).json({ success: true, application, compatibilityScore: score, tier: getScoreTier(score) });
};

// GET /api/applications/my  (tenant sees their applications)
const getMyApplications = async (req, res) => {
    const applications = await Application.find({ applicant: req.user._id })
        .populate('room', 'roomNumber type rent deposit')
        .populate('property', 'name address')
        .sort({ createdAt: -1 });
    res.json({ success: true, applications });
};

// GET /api/applications/property/:propertyId  (owner sees applications for their property)
const getPropertyApplications = async (req, res) => {
    const property = await Property.findOne({ _id: req.params.propertyId, owner: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found or not yours.' });

    const applications = await Application.find({ property: property._id })
        .populate('applicant', 'name email phone profilePic bio lifestyleProfile isVerified')
        .populate('room', 'roomNumber type rent capacity currentOccupancy')
        .sort({ compatibilityScore: -1, createdAt: -1 });
    res.json({ success: true, applications });
};

// PUT /api/applications/:id/approve  (owner)
const approveApplication = async (req, res) => {
    const application = await Application.findById(req.params.id).populate('room');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    const property = await Property.findOne({ _id: application.property, owner: req.user._id });
    if (!property) return res.status(403).json({ success: false, message: 'Forbidden.' });

    if (application.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Application is not pending.' });
    }

    application.status = 'approved';
    application.ownerNote = req.body.ownerNote || '';
    await application.save();

    // Update room occupancy
    await Room.findByIdAndUpdate(application.room._id, {
        $inc: { currentOccupancy: 1 },
        $addToSet: { currentTenants: application.applicant },
    });

    // Notify tenant
    await createNotification(
        application.applicant,
        'Application Approved! 🎉',
        `Your application for Room ${application.room.roomNumber} in ${property.name} has been approved.`,
        'application_update',
        application._id
    );

    res.json({ success: true, application });
};

// PUT /api/applications/:id/reject  (owner)
const rejectApplication = async (req, res) => {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    const property = await Property.findOne({ _id: application.property, owner: req.user._id });
    if (!property) return res.status(403).json({ success: false, message: 'Forbidden.' });

    application.status = 'rejected';
    application.ownerNote = req.body.ownerNote || '';
    await application.save();

    // Notify tenant
    await createNotification(
        application.applicant,
        'Application Update',
        `Your application for ${property.name} was not accepted at this time.`,
        'application_update',
        application._id
    );

    res.json({ success: true, application });
};

// PUT /api/applications/:id/withdraw  (tenant)
const withdrawApplication = async (req, res) => {
    const application = await Application.findOne({ _id: req.params.id, applicant: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (application.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Can only withdraw pending applications.' });
    }
    application.status = 'withdrawn';
    await application.save();
    res.json({ success: true, application });
};

module.exports = { createApplication, getMyApplications, getPropertyApplications, approveApplication, rejectApplication, withdrawApplication };
