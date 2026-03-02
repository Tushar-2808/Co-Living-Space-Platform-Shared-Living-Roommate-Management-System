const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true, index: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    propertyType: { type: String, enum: ['apartment', 'house', 'pg', 'hostel'], default: 'apartment' },
    totalRooms: { type: Number, required: true, min: 1 },
    amenities: [{
        type: String,
        enum: ['wifi', 'ac', 'parking', 'laundry', 'kitchen', 'gym', 'security', 'power_backup', 'water_purifier', 'tv', 'furnished'],
    }],
    houseRules: [{ type: String }],
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    genderPreference: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
}, { timestamps: true });

propertySchema.index({ location: '2dsphere' });
propertySchema.index({ 'address.city': 1, isActive: 1, isVerified: 1 });

module.exports = mongoose.model('Property', propertySchema);
