const router = require('express').Router();
const { getNotifications, retryNotification } = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, getNotifications);
router.post('/:id/retry', auth, authorize('coordinator'), retryNotification);

module.exports = router;
