const router = require('express').Router();
const { getRoomById, updateRoom, deleteRoom, getRoomCompatibility } = require('../controllers/room.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { validate, roomSchema } = require('../utils/validators');

router.get('/:id', getRoomById);
router.get('/:id/compatibility', requireAuth, requireRole('tenant'), getRoomCompatibility);
router.put('/:id', requireAuth, requireRole('owner'), validate(roomSchema), updateRoom);
router.delete('/:id', requireAuth, requireRole('owner'), deleteRoom);

module.exports = router;
