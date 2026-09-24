const router = require('express').Router();
const { getSessions, getSession, createSession, updateSession, submitSession, deleteSession } = require('../controllers/sessionController');
const { createSessionValidator, updateSessionValidator } = require('../validators/sessionValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, getSessions);
router.get('/:id', auth, getSession);
router.post('/', auth, authorize('coordinator'), createSessionValidator, validate, createSession);
router.put('/:id', auth, authorize('coordinator'), updateSessionValidator, validate, updateSession);
router.post('/:id/submit', auth, authorize('coordinator'), submitSession);
router.delete('/:id', auth, authorize('coordinator'), deleteSession);

module.exports = router;
