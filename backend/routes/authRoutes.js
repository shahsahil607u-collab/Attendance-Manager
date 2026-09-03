const router = require('express').Router();
const { login, logout, getMe } = require('../controllers/authController');
const { loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);

module.exports = router;
