// server/controllers/studentController.js
import Student from '../models/Student.js';
import User from '../models/User.js'; // To check if user exists and is student/parent
import Course from '../models/Course.js'; // To check if courses exist

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin, Teacher (for their students), Parent (for their children)
const getStudents = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'teacher') {
            // Find all courses taught by this teacher
            const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
            const courseIds = teacherCourses.map(course => course._id);

            // Find students who are enrolled in any of these courses
            query.enrolledCourses = { $in: courseIds };
        } else if (req.user.role === 'parent') {
            // Find students where this parent is assigned
            query.parent = req.user._id;
        }

        const students = await Student.find(query)
            .populate('user', 'firstName lastName email gender dateOfBirth phoneNumber address role')
            .populate('enrolledCourses', 'name code') // Populate course names/codes
            .populate('parent', 'firstName lastName email') // ✅ Correct


        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private/Admin, Teacher (for their student), Parent (for their child)
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
                                    .populate('user', 'firstName lastName email')
                                    .populate('enrolledCourses', 'name code')
                                    .populate('parent', 'firstName lastName email');

        if (student) {
            // Ensure parents can only view their own children's profiles
            if (req.user.role === 'parent' && student.parent && student.parent.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this student profile' });
            }
            res.status(200).json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
    const { userId, studentId, dateOfBirth, gender, currentClass, enrolledCourses, parentId } = req.body;

    if (!userId || !studentId || !dateOfBirth || !gender) {
        return res.status(400).json({ message: 'Please enter all required student fields' });
    }

    try {
        // Check if a User with the given userId exists and has a 'student' role
        const user = await User.findById(userId);
        if (!user || user.role !== 'student') {
            return res.status(400).json({ message: 'Invalid User ID provided, or user is not a student.' });
        }

        // Check if studentId is unique
        const studentExists = await Student.findOne({ studentId });
        if (studentExists) {
            return res.status(400).json({ message: 'Student with this ID already exists.' });
        }

        // Check if a student record already exists for this user
        const existingStudentRecord = await Student.findOne({ user: userId });
        if (existingStudentRecord) {
            return res.status(400).json({ message: 'A student record already exists for this user.' });
        }

        // Validate enrolledCourses (optional, but good practice)
        const validCourses = [];
        if (enrolledCourses && enrolledCourses.length > 0) {
            for (const courseId of enrolledCourses) {
                const course = await Course.findById(courseId);
                if (course) {
                    validCourses.push(course._id);
                } else {
                    console.warn(`Course with ID ${courseId} not found, skipping.`);
                }
            }
        }

        // Validate parentId (optional)
        let assignedParent = null;
        if (parentId) {
            const parentUser = await User.findOne({ _id: parentId, role: 'parent' });
            if (!parentUser) {
                return res.status(400).json({ message: 'Provided parent ID is invalid or not a parent.' });
            }
            assignedParent = parentUser._id;
        }

        const student = new Student({
            user: userId,
            studentId,
            dateOfBirth,
            gender,
            currentClass,
            enrolledCourses: validCourses,
            parent: assignedParent,
        });

        const createdStudent = await student.save();
        res.status(201).json(createdStudent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
    const { userId, studentId, dateOfBirth, gender, currentClass, enrolledCourses, parentId } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            // Ensure userId is not changed if it refers to another user
            if (userId && student.user.toString() !== userId) {
                return res.status(400).json({ message: 'Cannot change student record to another user ID' });
            }

            // Optionally, update user's role if student is no longer student
            // This logic can become complex, consider careful design if roles change frequently

            // Validate enrolledCourses if provided
            let updatedEnrolledCourses = student.enrolledCourses;
            if (enrolledCourses && Array.isArray(enrolledCourses)) {
                const validCourses = [];
                for (const courseId of enrolledCourses) {
                    const course = await Course.findById(courseId);
                    if (course) {
                        validCourses.push(course._id);
                    } else {
                        console.warn(`Course with ID ${courseId} not found during update, skipping.`);
                    }
                }
                updatedEnrolledCourses = validCourses;
            }

            // Validate parentId if provided
            let updatedParent = student.parent;
            if (parentId !== undefined) { // Allow explicit null for parentId to unassign
                if (parentId === null || parentId === '') {
                    updatedParent = null;
                } else {
                    const parentUser = await User.findOne({ _id: parentId, role: 'parent' });
                    if (!parentUser) {
                        return res.status(400).json({ message: 'Provided parent ID is invalid or not a parent.' });
                    }
                    updatedParent = parentUser._id;
                }
            }

            student.studentId = studentId || student.studentId;
            student.dateOfBirth = dateOfBirth || student.dateOfBirth;
            student.gender = gender || student.gender;
            student.currentClass = currentClass || student.currentClass;
            student.enrolledCourses = updatedEnrolledCourses;
            student.parent = updatedParent;

            const updatedStudent = await student.save();
            res.status(200).json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (student) {
            res.status(200).json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get courses for logged-in student
// @route   GET /api/student/me/courses
// @access  Private/Student
const getMyCourses = async (req, res) => {
  try {
    // Find student record linked to the current logged-in user
    const student = await Student.findOne({ user: req.user._id })
      .populate({
        path: 'enrolledCourses',
        populate: {
          path: 'teacher',
          select: 'firstName lastName',
        },
      });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    // Return populated enrolledCourses
    res.status(200).json(student.enrolledCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving student courses.' });
  }
};

// @desc    Get all children linked to the authenticated parent
// @route   GET /api/parent/me/children
// @access  Private (Parent)
const getMyChildren = async (req, res) => {
    try {
        // req.user._id is the ObjectId of the Parent User
        // Find students where the 'parent' field matches the logged-in parent's user ID
        const children = await Student.find({ 'parent.user': req.user._id })
            .populate('user', 'firstName lastName email gender dateOfBirth studentId') // Populate child's user details
            .populate('enrolledCourses', 'name code') // Optionally populate enrolled courses for overview
            .select('-academicRecords -attendanceRecords -grades -messages'); // Exclude sensitive details not needed in overview

        if (!children || children.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(children);
    } catch (error) {
        console.error('Error fetching children for parent:', error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get grades for a specific child linked to the authenticated parent
// @route   GET /api/parent/child/:studentId/grades
// @access  Private (Parent)
const getChildGrades = async (req, res) => {
    try {
        const { studentId } = req.params;

        // 1. Validate studentId format
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid student ID format.' });
        }

        // 2. Verify the requested student is indeed a child of the authenticated parent
        const child = await Student.findOne({ _id: studentId, 'parent.user': req.user._id });

        if (!child) {
            return res.status(404).json({ message: 'Child not found or not linked to this parent.' });
        }

        // 3. Fetch grades for this child
        // Assuming Grade model has a 'student' field that references the Student model
        const grades = await Grade.find({ student: child._id })
            .populate('course', 'name code') // Populate course name and code
            .select('-__v'); // Exclude mongoose version key

        res.status(200).json(grades);
    } catch (error) {
        console.error(`Error fetching grades for child ${req.params.studentId}:`, error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get attendance for a specific child linked to the authenticated parent
// @route   GET /api/parent/child/:studentId/attendance
// @access  Private (Parent)
const getChildAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;

        // 1. Validate studentId format
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid student ID format.' });
        }

        // 2. Verify the requested student is indeed a child of the authenticated parent
        const child = await Student.findOne({ _id: studentId, 'parent.user': req.user._id });

        if (!child) {
            return res.status(404).json({ message: 'Child not found or not linked to this parent.' });
        }

        // 3. Fetch attendance records for this child
        // Assuming Attendance model has a 'student' field that references the Student model
        const attendance = await Attendance.find({ student: child._id })
            .populate('course', 'name code') // Populate course name and code
            .select('-__v');

        res.status(200).json(attendance);
    } catch (error) {
        console.error(`Error fetching attendance for child ${req.params.studentId}:`, error);
        res.status(500).send('Server Error');
    }
};


// @desc    Get announcements relevant to the authenticated parent
// @route   GET /api/parent/me/announcements
// @access  Private (Parent)
const getParentAnnouncements = async (req, res) => {
    try {
        // Announcements targeted to 'all', 'parents', or 'parent' role specifically
        const announcements = await Announcement.find({
            targetAudience: { $in: ['all', 'parents'] } // Adjust based on your audience definitions
        })
        .populate('postedBy', 'firstName lastName') // Assuming postedBy is a User ID
        .sort({ datePosted: -1 });

        res.status(200).json(announcements);
    } catch (error) {
        console.error('Error fetching parent announcements:', error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get events relevant to the authenticated parent
// @route   GET /api/parent/me/events
// @access  Private (Parent)
const getParentEvents = async (req, res) => {
    try {
        // Events targeted to 'all', 'parents', or 'parent' role specifically, and not yet ended
        const events = await Event.find({
            targetAudience: { $in: ['all', 'parents'] }, // Adjust based on your audience definitions
            eventDate: { $gte: new Date() } // Only future events
        })
        .sort({ eventDate: 1 });

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching parent events:', error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get overall GPA for the logged-in student
// @route   GET /api/student/me/gpa
// @access  Private/Student
const getStudentGPA = async (req, res) => {
    try {
        // Find the student record linked to the current logged-in user
        const student = await Student.findOne({ user: req.user._id });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }

        // Fetch all grades for this student
        const grades = await Grade.find({ student: student._id }).populate('course', 'credits');

        if (grades.length === 0) {
            return res.json({ gpa: 0.0, message: 'No grades recorded yet.' });
        }

        let totalGradePoints = 0;
        let totalCredits = 0;

        for (const gradeEntry of grades) {
            if (gradeEntry.score !== undefined && gradeEntry.course && gradeEntry.course.credits !== undefined) {
                let gradePoints = 0;
                // Define your GPA scale here. This is a common 4.0 scale example.
                if (gradeEntry.score >= 90) { // A
                    gradePoints = 4.0;
                } else if (gradeEntry.score >= 80) { // B
                    gradePoints = 3.0;
                } else if (gradeEntry.score >= 70) { // C
                    gradePoints = 2.0;
                } else if (gradeEntry.score >= 60) { // D
                    gradePoints = 1.0;
                } else { // F
                    gradePoints = 0.0;
                }

                const credits = gradeEntry.course.credits;
                totalGradePoints += (gradePoints * credits);
                totalCredits += credits;
            }
        }

        const overallGPA = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0.0;

        res.status(200).json({ gpa: parseFloat(overallGPA.toFixed(2)) }); // Return GPA rounded to 2 decimal places

    } catch (error) {
        console.error('Error fetching student GPA:', error);
        res.status(500).json({ message: 'Server error retrieving student GPA.' });
    }
};



export {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getMyCourses,
    getMyChildren,
    getChildGrades,
    getChildAttendance,
    getParentAnnouncements,
    getParentEvents,
    getStudentGPA,
};