const router = require('express').Router();
const { getDailyReport, getMonthlyReport, getStudentReport, exportReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.get('/daily', auth, getDailyReport);
router.get('/monthly', auth, getMonthlyReport);
router.get('/student/:studentId', auth, getStudentReport);
router.get('/export', auth, exportReport);

module.exports = router;
