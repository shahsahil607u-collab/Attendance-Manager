const router = require('express').Router();
const { getSessions, getSession, createSession, updateSession, submitSession } = require('../controllers/sessionController');
const { createSessionValidator } = require('../validators/sessionValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, getSessions);
router.get('/:id', auth, getSession);
router.post('/', auth, authorize('coordinator'), createSessionValidator, validate, createSession);
router.put('/:id', auth, authorize('coordinator'), createSessionValidator, validate, updateSession);
router.post('/:id/submit', auth, authorize('coordinator'), submitSession);

module.exports = router;
