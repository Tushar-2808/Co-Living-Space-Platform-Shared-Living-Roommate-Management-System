require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');
const Property = require('./models/Property.model');
const Room = require('./models/Room.model');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Connected to MongoDB for seeding...');

        // Clear existing data
        await Property.deleteMany({});
        await Room.deleteMany({});
        console.log('🧹 Existing properties and rooms cleared.');

        // Find or create an owner
        let owner = await User.findOne({ role: 'owner' });
        if (!owner) {
            owner = await User.create({
                name: 'Tushar Properties',
                email: 'owner@nestmate.com',
                password: 'password123',
                role: 'owner',
                phone: '9876543210',
                isVerified: true,
                lifestyleCompleted: true
            });
            console.log('👤 Mock Owner Created');
        }

        const listings = [
            {
                name: 'Gulmohar Greens Co-Living',
                description: 'Modern apartments in the heart of Gurgaon, perfect for young professionals working in Cyber Hub.',
                address: { street: 'DLF Phase 3', city: 'Gurgaon', state: 'Haryana', pincode: '122002' },
                propertyType: 'apartment',
                totalRooms: 5,
                amenities: ['wifi', 'ac', 'security', 'power_backup', 'parking'],
                houseRules: ['No smoking', 'Quiet hours after 11 PM'],
                genderPreference: 'any',
                owner: owner._id,
                isVerified: true
            },
            {
                name: 'Silicon Valley Residency',
                description: 'Located near Manyata Tech Park, these rooms offer a peaceful environment with high-speed internet.',
                address: { street: 'Hebbal', city: 'Bangalore', state: 'Karnataka', pincode: '560024' },
                propertyType: 'hostel',
                totalRooms: 12,
                amenities: ['wifi', 'gym', 'laundry', 'water_purifier', 'security'],
                houseRules: ['No outsiders after 10 PM'],
                genderPreference: 'male',
                owner: owner._id,
                isVerified: true
            },
            {
                name: 'The Orchid Shared Living',
                description: 'Premium female-only co-living space with top-notch security and fully furnished rooms.',
                address: { street: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
                propertyType: 'apartment',
                totalRooms: 4,
                amenities: ['wifi', 'ac', 'security', 'furnished', 'kitchen'],
                houseRules: ['Female guests only', 'No pets'],
                genderPreference: 'female',
                owner: owner._id,
                isVerified: true
            },
            {
                name: 'Cyber City Hub PG',
                description: 'Walkable distance from Hitech City, offering delicious home-cooked meals and daily housekeeping.',
                address: { street: 'Madhapur', city: 'Hyderabad', state: 'Telangana', pincode: '500081' },
                propertyType: 'pg',
                totalRooms: 20,
                amenities: ['wifi', 'laundry', 'kitchen', 'tv', 'power_backup'],
                houseRules: ['Meal timings are strict'],
                genderPreference: 'any',
                owner: owner._id,
                isVerified: true
            },
            {
                name: 'Magarpatta Comfort Stays',
                description: 'Right inside Magarpatta City, these rooms are ideal for IT professionals working in the township.',
                address: { street: 'Hadapsar', city: 'Pune', state: 'Maharashtra', pincode: '411028' },
                propertyType: 'house',
                totalRooms: 8,
                amenities: ['wifi', 'parking', 'gym', 'security', 'ac'],
                houseRules: ['Maintain cleanliness in common areas'],
                genderPreference: 'any',
                owner: owner._id,
                isVerified: true
            },
            {
                name: 'Gomti Nagar Executive PG',
                description: 'Upscale PG with large balconies and a shared lounge area for students and professionals.',
                address: { street: 'Vibhuti Khand', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010' },
                propertyType: 'pg',
                totalRooms: 15,
                amenities: ['wifi', 'ac', 'tv', 'water_purifier', 'laundry'],
                houseRules: ['No alcohol on premises'],
                genderPreference: 'male',
                owner: owner._id,
                isVerified: true
            },
            {
                name: 'Salt Lake Techies Home',
                description: 'Cozy rooms in Sector V, very close to the corporate hub and metro station.',
                address: { street: 'Sector V', city: 'Kolkata', state: 'West Bengal', pincode: '700091' },
                propertyType: 'apartment',
                totalRooms: 6,
                amenities: ['wifi', 'security', 'kitchen', 'power_backup', 'furnished'],
                houseRules: ['No loud music'],
                genderPreference: 'any',
                owner: owner._id,
                isVerified: true
            },
            {
                name: 'Indiranagar Boutique Living',
                description: 'Situated in the most happening place of Bangalore, close to cafes and restaurants.',
                address: { street: '100ft Road', city: 'Bangalore', state: 'Karnataka', pincode: '560038' },
                propertyType: 'house',
                totalRooms: 4,
                amenities: ['wifi', 'parking', 'furnished', 'ac', 'security'],
                houseRules: ['Respect neighbors Privacy'],
                genderPreference: 'any',
                owner: owner._id,
                isVerified: true
            },
            {
                name: 'Vasant Kunj Garden Suites',
                description: 'Spacious rooms with green views, very safe and located in a posh residential area.',
                address: { street: 'Sector B', city: 'Delhi', state: 'Delhi', pincode: '110070' },
                propertyType: 'house',
                totalRooms: 5,
                amenities: ['wifi', 'security', 'parking', 'kitchen', 'gym'],
                houseRules: ['Proper waste segregation required'],
                genderPreference: 'female',
                owner: owner._id,
                isVerified: true
            },
            {
                name: 'OMR Tech Corridor PG',
                description: 'Located on the main OMR road, offering easy commute to all major IT parks.',
                address: { street: 'Sholinganallur', city: 'Chennai', state: 'Tamil Nadu', pincode: '600119' },
                propertyType: 'pg',
                totalRooms: 25,
                amenities: ['wifi', 'ac', 'laundry', 'water_purifier', 'power_backup'],
                houseRules: ['No smoking in rooms'],
                genderPreference: 'male',
                owner: owner._id,
                isVerified: true
            }
        ];

        for (const item of listings) {
            const property = await Property.create(item);

            // Create rooms for each property
            for (let i = 1; i <= 3; i++) {
                await Room.create({
                    property: property._id,
                    roomNumber: `R-${100 + i}`,
                    type: i === 1 ? 'private' : 'shared',
                    rent: 8000 + (Math.floor(Math.random() * 8) * 1000),
                    deposit: 15000 + (Math.floor(Math.random() * 10) * 1000),
                    capacity: i === 1 ? 1 : 2,
                    amenities: ['bed', 'desk', 'wardrobe', 'fan'],
                    isActive: true
                });
            }
        }

        console.log('✅ Seeding Complete with 10 Indian properties!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();
