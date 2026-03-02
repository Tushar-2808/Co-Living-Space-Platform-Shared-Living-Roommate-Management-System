const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['tenant', 'owner']).default('tenant'),
    phone: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const lifestyleSchema = z.object({
    smoking: z.enum(['never', 'occasionally', 'regularly']),
    pets: z.enum(['no', 'yes', 'allergic']),
    cleanliness: z.enum(['relaxed', 'moderate', 'very_clean']),
    lateNight: z.enum(['early_bird', 'moderate', 'night_owl']),
    workFromHome: z.enum(['never', 'sometimes', 'always']),
    socialPreference: z.enum(['introvert', 'ambivert', 'extrovert']),
    foodPreference: z.enum(['veg', 'non_veg', 'vegan', 'any']),
    guestPolicy: z.enum(['no_guests', 'occasional', 'frequent']),
});

const propertySchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10),
    address: z.object({
        street: z.string().min(3),
        city: z.string().min(2),
        state: z.string().min(2),
        pincode: z.string().min(4).max(10),
    }),
    propertyType: z.enum(['apartment', 'house', 'pg', 'hostel']).default('apartment'),
    totalRooms: z.number().min(1),
    amenities: z.array(z.enum(['wifi', 'ac', 'parking', 'laundry', 'kitchen', 'gym', 'security', 'power_backup', 'water_purifier', 'tv', 'furnished'])).default([]),
    houseRules: z.array(z.string()).default([]),
    genderPreference: z.enum(['male', 'female', 'any']).default('any'),
    location: z.object({
        coordinates: z.array(z.number()).length(2),
    }).optional(),
});

const roomSchema = z.object({
    roomNumber: z.string().min(1),
    type: z.enum(['shared', 'private']),
    rent: z.number().min(0),
    deposit: z.number().min(0),
    capacity: z.number().min(1),
    amenities: z.array(z.enum(['attached_bath', 'balcony', 'wardrobe', 'ac', 'tv', 'fan', 'bed', 'desk'])).default([]),
    availableFrom: z.string().optional(),
});

const applicationSchema = z.object({
    message: z.string().max(500).optional(),
    moveInDate: z.string().optional(),
});

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
    }
    req.body = result.data;
    next();
};

module.exports = { registerSchema, loginSchema, lifestyleSchema, propertySchema, roomSchema, applicationSchema, validate };
