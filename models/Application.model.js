const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'withdrawn'],
        default: 'pending',
    },
    compatibilityScore: { type: Number, min: 0, max: 100, default: null },
    compatibilityBreakdown: { type: Object, default: {} },
    message: { type: String, maxlength: 500 },
    ownerNote: { type: String, maxlength: 500 },
    moveInDate: { type: Date },
}, { timestamps: true });

applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ property: 1, status: 1 });
applicationSchema.index({ room: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
