const Property = require('../models/Property.model');
const Room = require('../models/Room.model');
const { calculateCompatibility, getScoreTier } = require('../services/matching.service');

// GET /api/matching/suggestions
const getSuggestions = async (req, res) => {
    if (!req.user.lifestyleCompleted) {
        return res.status(400).json({ success: false, message: 'Please complete your lifestyle profile first.' });
    }

    // Find active rooms
    const rooms = await Room.find({ isActive: true })
        .populate('property', 'name address propertyType')
        .populate('currentTenants', 'lifestyleProfile')
        .lean();

    const suggestions = rooms.map(room => {
        const { score, breakdown } = calculateCompatibility(req.user.lifestyleProfile, room.currentTenants);
        return {
            ...room,
            compatibility: {
                score,
                breakdown,
                ...getScoreTier(score)
            }
        };
    });

    // Sort by score descending
    suggestions.sort((a, b) => b.compatibility.score - a.compatibility.score);

    res.json({
        success: true,
        suggestions: suggestions.slice(0, 10) // Return top 10 matches
    });
};

module.exports = { getSuggestions };
