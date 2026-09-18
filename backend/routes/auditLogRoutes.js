const router = require('express').Router();
const { getAuditLogs, deleteAuditLog, clearAuditLogs } = require('../controllers/auditLogController');
const auth = require('../middleware/auth');

router.get('/', auth, getAuditLogs);
router.delete('/:id', auth, deleteAuditLog);
router.delete('/', auth, clearAuditLogs);

module.exports = router;
