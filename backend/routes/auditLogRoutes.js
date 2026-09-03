const router = require('express').Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const auth = require('../middleware/auth');

router.get('/', auth, getAuditLogs);

module.exports = router;
