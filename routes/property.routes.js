const router = require('express').Router();
const {
    getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, getOwnerProperties,
} = require('../controllers/property.controller');
const { createRoom } = require('../controllers/room.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { validate, propertySchema, roomSchema } = require('../utils/validators');

router.get('/', getProperties);
router.get('/owner/my', requireAuth, requireRole('owner'), getOwnerProperties);
router.get('/:id', getPropertyById);
router.post('/', requireAuth, requireRole('owner'), validate(propertySchema), createProperty);
router.put('/:id', requireAuth, requireRole('owner'), updateProperty);
router.delete('/:id', requireAuth, requireRole('owner', 'admin'), deleteProperty);

// Nested: create room under a property
router.post('/:propertyId/rooms', requireAuth, requireRole('owner'), validate(roomSchema), createRoom);

module.exports = router;
