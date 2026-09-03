const router = require('express').Router();
const { markAttendance, getSessionAttendance, getStudentAttendance, correctAttendance } = require('../controllers/attendanceController');
const { markAttendanceValidator, correctionValidator } = require('../validators/attendanceValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/mark', auth, authorize('coordinator'), markAttendanceValidator, validate, markAttendance);
router.get('/session/:sessionId', auth, getSessionAttendance);
router.get('/student/:studentId', auth, getStudentAttendance);
router.post('/correction', auth, authorize('coordinator'), correctionValidator, validate, correctAttendance);

module.exports = router;
