const router = require('express').Router();
const {
    getStats, getUsers, verifyUser, deactivateUser, adminGetProperties, verifyProperty,
} = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.use(requireAuth, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/deactivate', deactivateUser);
router.get('/properties', adminGetProperties);
router.put('/properties/:id/verify', verifyProperty);

module.exports = router;
