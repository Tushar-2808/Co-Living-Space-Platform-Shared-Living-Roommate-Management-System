const router = require('express').Router();
const { register, login, logout, getMe } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate, registerSchema, loginSchema } = require('../utils/validators');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

module.exports = router;
