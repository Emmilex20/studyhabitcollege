// server/controllers/gradeController.js
import Grade from '../models/Grade.js';
import Course from '../models/Course.js'; // Import Course model
import Student from '../models/Student.js'; // Import Student model

// Helper function to check if a teacher teaches a course
const teacherTeachesCourse = async (teacherId, courseId) => {
    const course = await Course.findById(courseId);
    // Ensure the course exists and the teacher matches
    return course && course.teacher.toString() === teacherId.toString();
};

// Helper function to check if a teacher is associated with a student via a course
const teacherAssociatedWithStudentInCourse = async (teacherId, studentId, courseId) => {
    try {
        const course = await Course.findById(courseId).populate('students'); // Populate students if needed, or ensure it's loaded as IDs

        if (!course) {
            console.log(`Course with ID ${courseId} not found.`);
            return false; // Course doesn't exist
        }

        // Check if the teacher is assigned to this course
        if (!course.teacher || course.teacher.toString() !== teacherId.toString()) {
            console.log(`Teacher ${teacherId} is not assigned to course ${courseId}.`);
            return false; // Teacher is not the assigned teacher for this course
        }

        // Check if the student is enrolled in this course
        // Ensure course.students is an array and contains the studentId
        if (!Array.isArray(course.students) || !course.students.some(s => s.equals(studentId))) {
             console.log(`Student ${studentId} is not enrolled in course ${courseId}.`);
            return false; // Student is not in the course's student list
        }

        return true; // All checks pass
    } catch (error) {
        console.error("Error in teacherAssociatedWithStudentInCourse:", error);
        return false;
    }
};

// @desc    Get all grades (Admin sees all, Teacher sees their courses' grades)
// @route   GET /api/grades
// @access  Private (Admin, Teacher, Student, Parent)
const getGrades = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'teacher') {
            // Find courses taught by this teacher
            const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
            const courseIds = teacherCourses.map(course => course._id);
            query.course = { $in: courseIds }; // Filter grades by courses taught by the teacher
        } else if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id }).select('_id');
            if (!student) {
                return res.status(404).json({ message: 'Student profile not found.' });
            }
            query.student = student._id; // Filter grades by the logged-in student
        } else if (req.user.role === 'parent') {
            // Assuming parent has linked students
            const children = await Student.find({ parent: req.user._id }).select('_id');
            const childrenIds = children.map(child => child._id);
            if (childrenIds.length === 0) {
                return res.status(200).json([]); // No grades if no children linked
            }
            query.student = { $in: childrenIds }; // Filter grades by parent's children
        }

        const grades = await Grade.find(query)
            .populate({
                path: 'student',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                },
                select: 'studentId'
            })
            .populate('course', 'name code')
            .populate('teacher', 'firstName lastName email')
            .sort({ dateGraded: -1 }); // Sort by most recent grades
        res.status(200).json(grades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single grade by ID
// @route   GET /api/grades/:id
// @access  Private (Admin, Teacher, Student, Parent)
const getGradeById = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id)
            .populate({
                path: 'student',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                },
                select: 'studentId'
            })
            .populate('course', 'name code')
            .populate('teacher', 'firstName lastName email');

        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        // Authorization check based on role
        if (req.user.role === 'teacher') {
            if (grade.teacher.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this grade record' });
            }
        } else if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id });
            if (!student || grade.student._id.toString() !== student._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this grade record' });
            }
        } else if (req.user.role === 'parent') {
            const children = await Student.find({ parent: req.user._id });
            const isChildsGrade = children.some(child => child._id.toString() === grade.student._id.toString());
            if (!isChildsGrade) {
                return res.status(403).json({ message: 'Not authorized to view this grade record' });
            }
        }

        res.status(200).json(grade);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new grade
// @route   POST /api/grades
// @access  Private/Admin, Teacher
const createGrade = async (req, res) => {
    const { student, course, gradeType, score, weight, term, academicYear, remarks } = req.body;

    if (!student || !course || !gradeType || score === undefined || !term || !academicYear) {
        res.status(400);
        throw new Error('Please provide student, course, gradeType, score, term, and academicYear.');
    }

    if (score < 0 || score > 100) {
        res.status(400);
        throw new Error('Score must be between 0 and 100.');
    }

    try {
        // Teacher specific authorization: A teacher can only create grades for courses they teach
        if (req.user.role === 'teacher') {
            const isTeacherOfCourse = await teacherTeachesCourse(req.user._id, course);
            if (!isTeacherOfCourse) {
                return res.status(403).json({ message: 'Not authorized to add grades for this course.' });
            }
            const isStudentInCourse = await teacherAssociatedWithStudentInCourse(req.user._id, student, course);
            if (!isStudentInCourse) {
                return res.status(403).json({ message: 'Student is not in this course or you do not teach them for this course.' });
            }
        }

        // Check for duplicate grade for the same student, course, grade type, term, and academic year
        const existingGrade = await Grade.findOne({
            student,
            course,
            gradeType,
            term,
            academicYear
        });

        if (existingGrade) {
            return res.status(400).json({ message: 'A grade for this student, course, grade type, term, and academic year already exists. Please update it instead.' });
        }

        const grade = new Grade({
            student,
            course,
            teacher: req.user._id, // Assign the logged-in user (admin or teacher) as the recorder
            gradeType,
            score,
            weight: weight !== undefined ? weight : 1, // Default weight to 1
            term,
            academicYear,
            remarks,
        });

        const createdGrade = await grade.save();
        await createdGrade.populate([
            { path: 'student', populate: { path: 'user', select: 'firstName lastName email' }, select: 'studentId' },
            { path: 'course', select: 'name code' },
            { path: 'teacher', select: 'firstName lastName email' }
        ]);
        res.status(201).json(createdGrade);
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Update an existing grade
// @route   PUT /api/grades/:id
// @access  Private/Admin, Teacher
const updateGrade = async (req, res) => {
    const { score, remarks, gradeType, weight } = req.body; // Allow updating score, remarks, type, weight

    try {
        const grade = await Grade.findById(req.params.id);

        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        // Teacher specific authorization: Only allow teacher to update grades for courses they teach
        if (req.user.role === 'teacher') {
            const isTeacherOfCourse = await teacherTeachesCourse(req.user._id, grade.course);
            if (!isTeacherOfCourse) {
                return res.status(403).json({ message: 'Not authorized to update grades for this course.' });
            }
        }

        // Admin can update anything.
        if (score !== undefined) {
            if (score < 0 || score > 100) {
                res.status(400);
                throw new Error('Score must be between 0 and 100.');
            }
            grade.score = score;
        }
        if (remarks !== undefined) grade.remarks = remarks;
        if (gradeType !== undefined) grade.gradeType = gradeType;
        if (weight !== undefined) grade.weight = weight;

        const updatedGrade = await grade.save();
        await updatedGrade.populate([
            { path: 'student', populate: { path: 'user', select: 'firstName lastName email' }, select: 'studentId' },
            { path: 'course', select: 'name code' },
            { path: 'teacher', select: 'firstName lastName email' }
        ]);
        res.status(200).json(updatedGrade);
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Delete a grade
// @route   DELETE /api/grades/:id
// @access  Private/Admin, Teacher
const deleteGrade = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);

        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        // Teacher specific authorization
        if (req.user.role === 'teacher') {
            const isTeacherOfCourse = await teacherTeachesCourse(req.user._id, grade.course);
            if (!isTeacherOfCourse) {
                return res.status(403).json({ message: 'Not authorized to delete grades for this course.' });
            }
        }

        await grade.deleteOne();
        res.status(200).json({ message: 'Grade removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get grades for the logged-in student
// @route   GET /api/students/me/grades
// @access  Private/Student
const getMyGrades = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const grades = await Grade.find({ student: student._id })
      .populate('course', 'name code')
      .sort({ dateGraded: -1 });

    const formattedGrades = grades.map((grade) => ({
      _id: grade._id,
      courseName: grade.course.name,
      courseCode: grade.course.code,
      assignmentName: grade.gradeType,
      score: grade.score,
      maxScore: 100, // or replace if using a custom max
      percentage: `${((grade.score / 100) * 100).toFixed(2)}%`,
      dateGraded: grade.dateGraded.toISOString(),
      feedback: grade.remarks || '',
    }));

    res.status(200).json(formattedGrades);
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export {
    getGrades,
    getGradeById,
    createGrade,
    updateGrade,
    deleteGrade,
    getMyGrades,
};