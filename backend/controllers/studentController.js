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

    // Search by name or registration number
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
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
    const { fullName, registrationNumber, email, phone, department, semester, year, team } = req.body;

    // Check for duplicate registration number
    const existing = await Student.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A student with this registration number already exists.',
      });
    }

    const student = await Student.create({
      fullName,
      registrationNumber,
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
      description: `Created student ${fullName} (${registrationNumber})`,
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

    // If registration number changed, check for duplicates
    if (req.body.registrationNumber && req.body.registrationNumber.trim() !== '' && req.body.registrationNumber.toUpperCase() !== student.registrationNumber) {
      const existing = await Student.findOne({ registrationNumber: req.body.registrationNumber.toUpperCase() });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A student with this registration number already exists.',
        });
      }
    }

    const allowedFields = ['fullName', 'registrationNumber', 'email', 'phone', 'department', 'semester', 'year', 'team'];
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
      description: `Updated student ${student.fullName} (${student.registrationNumber})`,
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
      description: `${action} student ${student.fullName} (${student.registrationNumber})`,
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
