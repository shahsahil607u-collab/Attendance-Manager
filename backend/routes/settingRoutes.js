const router = require('express').Router();
const { getSettings, updateSetting } = require('../controllers/settingController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, getSettings);
router.put('/:key', auth, authorize('coordinator'), updateSetting);

module.exports = router;
