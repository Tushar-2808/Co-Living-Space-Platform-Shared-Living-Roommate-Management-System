const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const lifestyleProfileSchema = new mongoose.Schema({
    smoking: { type: String, enum: ['never', 'occasionally', 'regularly'], default: 'never' },
    pets: { type: String, enum: ['no', 'yes', 'allergic'], default: 'no' },
    cleanliness: { type: String, enum: ['relaxed', 'moderate', 'very_clean'], default: 'moderate' },
    lateNight: { type: String, enum: ['early_bird', 'moderate', 'night_owl'], default: 'moderate' },
    workFromHome: { type: String, enum: ['never', 'sometimes', 'always'], default: 'never' },
    socialPreference: { type: String, enum: ['introvert', 'ambivert', 'extrovert'], default: 'ambivert' },
    foodPreference: { type: String, enum: ['veg', 'non_veg', 'vegan', 'any'], default: 'any' },
    guestPolicy: { type: String, enum: ['no_guests', 'occasional', 'frequent'], default: 'occasional' },
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['tenant', 'owner', 'admin'], default: 'tenant' },
    phone: { type: String, trim: true },
    profilePic: { type: String, default: '' },
    bio: { type: String, maxlength: 500 },
    isVerified: { type: Boolean, default: true },
    kycDocument: { type: String, default: '' },
    lifestyleProfile: { type: lifestyleProfileSchema, default: {} },
    lifestyleCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
