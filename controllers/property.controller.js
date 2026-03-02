const Property = require('../models/Property.model');
const Room = require('../models/Room.model');

// GET /api/properties?city=&type=&gender=&amenities=&page=
const getProperties = async (req, res) => {
    const { city, type, gender, amenities, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (type) filter.propertyType = type;
    if (gender) filter.genderPreference = { $in: [gender, 'any'] };
    if (amenities) filter.amenities = { $all: amenities.split(',') };

    const skip = (Number(page) - 1) * Number(limit);
    const [properties, total] = await Promise.all([
        Property.find(filter).populate('owner', 'name profilePic phone').skip(skip).limit(Number(limit)).lean(),
        Property.countDocuments(filter),
    ]);
    res.json({ success: true, properties, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// GET /api/properties/:id
const getPropertyById = async (req, res) => {
    const property = await Property.findById(req.params.id).populate('owner', 'name profilePic phone email bio isVerified');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });
    const rooms = await Room.find({ property: property._id, isActive: true }).populate('currentTenants', 'name profilePic lifestyleProfile');
    res.json({ success: true, property, rooms });
};

// POST /api/properties  (owner only)
const createProperty = async (req, res) => {
    const data = { ...req.body, owner: req.user._id };
    if (req.body.location?.coordinates) {
        data.location = { type: 'Point', coordinates: req.body.location.coordinates };
    }
    const property = await Property.create(data);
    res.status(201).json({ success: true, property });
};

// PUT /api/properties/:id  (owner only)
const updateProperty = async (req, res) => {
    const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found or not yours.' });
    Object.assign(property, req.body);
    await property.save();
    res.json({ success: true, property });
};

// DELETE /api/properties/:id  (owner or admin)
const deleteProperty = async (req, res) => {
    const query = req.user.role === 'admin'
        ? { _id: req.params.id }
        : { _id: req.params.id, owner: req.user._id };
    const property = await Property.findOneAndUpdate(query, { isActive: false }, { new: true });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });
    res.json({ success: true, message: 'Property deactivated.' });
};

// GET /api/properties/owner/my  (owner's own listings)
const getOwnerProperties = async (req, res) => {
    const properties = await Property.find({ owner: req.user._id }).lean();
    res.json({ success: true, properties });
};

module.exports = { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, getOwnerProperties };
