const express = require('express');
const router = express.Router();
const { getSuggestions } = require('../controllers/matching.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/suggestions', getSuggestions);

module.exports = router;
