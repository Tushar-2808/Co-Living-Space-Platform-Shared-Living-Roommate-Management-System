const router = require('express').Router();
const { getProfile, updateProfile, updateLifestyle, getUserById } = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate, lifestyleSchema } = require('../utils/validators');

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.put('/lifestyle', requireAuth, validate(lifestyleSchema), updateLifestyle);
router.get('/:id', requireAuth, getUserById);

module.exports = router;
