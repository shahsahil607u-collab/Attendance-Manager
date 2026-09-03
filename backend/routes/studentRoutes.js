const router = require('express').Router();
const { getStudents, getStudent, createStudent, updateStudent, deactivateStudent } = require('../controllers/studentController');
const { createStudentValidator, updateStudentValidator } = require('../validators/studentValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, getStudents);
router.get('/:id', auth, getStudent);
router.post('/', auth, authorize('coordinator'), createStudentValidator, validate, createStudent);
router.put('/:id', auth, authorize('coordinator'), updateStudentValidator, validate, updateStudent);
router.patch('/:id/deactivate', auth, authorize('coordinator'), deactivateStudent);

module.exports = router;
