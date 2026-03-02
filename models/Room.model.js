const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    roomNumber: { type: String, required: true },
    type: { type: String, enum: ['shared', 'private'], required: true },
    rent: { type: Number, required: true, min: 0 },
    deposit: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    currentOccupancy: { type: Number, default: 0 },
    currentTenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    amenities: [{
        type: String,
        enum: ['attached_bath', 'balcony', 'wardrobe', 'ac', 'tv', 'fan', 'bed', 'desk'],
    }],
    availableFrom: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// virtual: is the room available?
roomSchema.virtual('isAvailable').get(function () {
    return this.currentOccupancy < this.capacity;
});

roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema);
