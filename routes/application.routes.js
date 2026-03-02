const router = require('express').Router();
const {
    createApplication, getMyApplications, getPropertyApplications,
    approveApplication, rejectApplication, withdrawApplication,
} = require('../controllers/application.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.post('/', requireAuth, requireRole('tenant'), createApplication);
router.get('/my', requireAuth, requireRole('tenant'), getMyApplications);
router.get('/property/:propertyId', requireAuth, requireRole('owner'), getPropertyApplications);
router.put('/:id/approve', requireAuth, requireRole('owner'), approveApplication);
router.put('/:id/reject', requireAuth, requireRole('owner'), rejectApplication);
router.put('/:id/withdraw', requireAuth, requireRole('tenant'), withdrawApplication);

module.exports = router;
