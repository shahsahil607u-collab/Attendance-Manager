const Student = require('../models/Student');
const { createAuditLog } = require('../services/auditService');

/**
 * GET /api/students
 * List students with pagination, search, filtering, and sorting.
 */
const getStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      isActive,
      department,
      team,
      sortBy = 'fullName',
      sortOrder = 'asc',
    } = req.query;

    const query = {};

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by team
    if (team) {
      query.team = team;
    }

    // Search by name or roll number
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [students, total] = await Promise.all([
      Student.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Student.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/:id
 */
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/students
 */
const createStudent = async (req, res, next) => {
  try {
    const { fullName, rollNumber, email, phone, department, semester, year, team } = req.body;

    // Check for duplicate roll number
    const existing = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A student with this roll number already exists.',
      });
    }

    const student = await Student.create({
      fullName,
      rollNumber,
      email,
      phone,
      department,
      semester,
      year,
      team,
    });

    await createAuditLog({
      action: 'STUDENT_CREATED',
      performedBy: req.user._id,
      targetType: 'Student',
      targetId: student._id,
      description: `Created student ${fullName} (${rollNumber})`,
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/students/:id
 */
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    // If roll number changed, check for duplicates
    if (req.body.rollNumber && req.body.rollNumber.trim() !== '' && req.body.rollNumber.toUpperCase() !== student.rollNumber) {
      const existing = await Student.findOne({ rollNumber: req.body.rollNumber.toUpperCase() });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A student with this roll number already exists.',
        });
      }
    }

    const allowedFields = ['fullName', 'rollNumber', 'email', 'phone', 'department', 'semester', 'year', 'team'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    await createAuditLog({
      action: 'STUDENT_UPDATED',
      performedBy: req.user._id,
      targetType: 'Student',
      targetId: student._id,
      description: `Updated student ${student.fullName} (${student.rollNumber})`,
    });

    res.json({
      success: true,
      message: 'Student updated successfully.',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/students/:id/deactivate
 */
const deactivateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    student.isActive = !student.isActive;
    await student.save();

    const action = student.isActive ? 'reactivated' : 'deactivated';

    await createAuditLog({
      action: 'STUDENT_DEACTIVATED',
      performedBy: req.user._id,
      targetType: 'Student',
      targetId: student._id,
      description: `${action} student ${student.fullName} (${student.rollNumber})`,
      metadata: { isActive: student.isActive },
    });

    res.json({
      success: true,
      message: `Student ${action} successfully.`,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deactivateStudent };
