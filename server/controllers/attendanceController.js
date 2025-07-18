// server/controllers/attendanceController.js
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js'; // Import Course model
import Student from '../models/Student.js'; // Import Student model

// Helper function to check if a teacher teaches a course
const teacherTeachesCourse = async (teacherId, courseId) => {
    // If courseId is null (general attendance), this check doesn't apply, return true as it's general
    if (!courseId) return true;
    const course = await Course.findById(courseId);
    return course && course.teacher.toString() === teacherId.toString();
};

// Helper function to check if a student is in a teacher's course
const isStudentInTeachersCourse = async (teacherId, studentId, courseId) => {
    if (!courseId) return true; // For general attendance, no course-specific student check

    // First, check if the course exists and is taught by the given teacher
    const course = await Course.findById(courseId);
    if (!course || course.teacher.toString() !== teacherId.toString()) {
        console.warn(`Attempt to verify student for course not taught by teacher ${teacherId} or course ${courseId} not found.`);
        return false;
    }

    // Now, find the student and POPULATE their 'enrolledCourses' array
    const student = await Student.findById(studentId).populate('enrolledCourses'); // FIX: Populate 'enrolledCourses'

    // Check if student exists and their 'enrolledCourses' array includes the specific courseId
    // Ensure student.enrolledCourses is an array before calling .some()
    return student && Array.isArray(student.enrolledCourses) && student.enrolledCourses.some(c => c._id.toString() === courseId.toString());
};


// @desc     Get all attendance records (Admin sees all, Teacher sees their courses' attendance)
// @route    GET /api/attendance
// @access   Private (Admin, Teacher, Student, Parent)
const getAttendance = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'teacher') {
            const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
            const courseIds = teacherCourses.map(course => course._id);
            // Get attendance records for specific courses taught by the teacher
            // OR general attendance records (where course is null) IF recorded by this teacher
            query.$or = [
                { course: { $in: courseIds } },
                { course: null, teacher: req.user._id } // Teacher can see general attendance they recorded
            ];
        } else if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id }).select('_id');
            if (!student) {
                return res.status(404).json({ message: 'Student profile not found.' });
            }
            query.student = student._id; // Filter attendance by the logged-in student
        } else if (req.user.role === 'parent') {
            const children = await Student.find({ parent: req.user._id }).select('_id');
            const childrenIds = children.map(child => child._id);
            if (childrenIds.length === 0) {
                return res.status(200).json([]); // No attendance if no children linked
            }
            query.student = { $in: childrenIds }; // Filter attendance by parent's children
        }

        const attendanceRecords = await Attendance.find(query)
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
            .sort({ date: -1 }); // Sort by most recent date
        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc     Get single attendance record by ID
// @route    GET /api/attendance/:id
// @access   Private
const getAttendanceById = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id)
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

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Authorization check based on role
        if (req.user.role === 'teacher') {
            if (attendance.course) { // Course-specific attendance
                const isTeacherOfCourse = await teacherTeachesCourse(req.user._id, attendance.course._id);
                if (!isTeacherOfCourse) {
                    return res.status(403).json({ message: 'Not authorized to view this record.' });
                }
            } else { // General attendance
                if (attendance.teacher.toString() !== req.user._id.toString()) {
                    return res.status(403).json({ message: 'Not authorized to view this general attendance record.' });
                }
            }
        } else if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id });
            if (!student || attendance.student._id.toString() !== student._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this attendance record.' });
            }
        } else if (req.user.role === 'parent') {
            const children = await Student.find({ parent: req.user._id });
            const isChildsAttendance = children.some(child => child._id.toString() === attendance.student._id.toString());
            if (!isChildsAttendance) {
                return res.status(403).json({ message: 'Not authorized to view this attendance record.' });
            }
        }

        res.status(200).json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc     Create a new attendance record
// @route    POST /api/attendance
// @access   Private/Admin, Teacher
const createAttendance = async (req, res) => {
    const { student, course, date, status, remarks } = req.body;

    if (!student || !date || !status) {
        res.status(400);
        throw new Error('Please provide student, date, and status.');
    }

    try {
        // Teacher specific authorization
        if (req.user.role === 'teacher') {
            const isTeacherAllowed = await teacherTeachesCourse(req.user._id, course); // Handles null course for general attendance
            if (!isTeacherAllowed) {
                return res.status(403).json({ message: 'Not authorized to add attendance for this course.' });
            }
            // If specific course, verify student is in that course
            if (course) {
                // Ensure the student ID passed in the body is a valid student ID
                const actualStudent = await Student.findById(student).populate('enrolledCourses'); // IMPORTANT: Populate student 'enrolledCourses' here too for proper validation
                if (!actualStudent) {
                    return res.status(404).json({ message: 'Student not found.' });
                }

                const studentInCourse = await isStudentInTeachersCourse(req.user._id, actualStudent._id, course); // Pass actualStudent._id
                if (!studentInCourse) {
                    return res.status(403).json({ message: 'Student is not in this course or you do not teach them for this course.' });
                }
            }
        }

        // Check for duplicate attendance for the same student, course (or null), and date
        const existingRecord = await Attendance.findOne({
            student,
            course: course || null, // Match if course is null in DB
            date: new Date(date).setHours(0, 0, 0, 0) // Compare only date part
        });

        if (existingRecord) {
            return res.status(400).json({ message: 'Attendance record for this student, course, and date already exists. Please update it instead.' });
        }

        const attendance = new Attendance({
            student,
            course: course || null,
            teacher: req.user._id, // The logged-in user is the teacher who recorded it
            date,
            status,
            remarks,
        });

        const createdAttendance = await attendance.save();
        await createdAttendance.populate([
            { path: 'student', populate: { path: 'user', select: 'firstName lastName email' }, select: 'studentId' },
            { path: 'course', select: 'name code' },
            { path: 'teacher', select: 'firstName lastName email' }
        ]);
        res.status(201).json(createdAttendance);
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc     Update an attendance record
// @route    PUT /api/attendance/:id
// @access   Private/Admin, Teacher
const updateAttendance = async (req, res) => {
    const { status, remarks } = req.body; // Only allow status and remarks to be updated for existing records

    try {
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Teacher specific authorization
        if (req.user.role === 'teacher') {
            const isTeacherAllowed = await teacherTeachesCourse(req.user._id, attendance.course); // Handles null course
            if (!isTeacherAllowed) {
                return res.status(403).json({ message: 'Not authorized to update this attendance record.' });
            }
        }

        if (status !== undefined) attendance.status = status;
        if (remarks !== undefined) attendance.remarks = remarks;

        const updatedAttendance = await attendance.save();
        await updatedAttendance.populate([
            { path: 'student', populate: { path: 'user', select: 'firstName lastName email' }, select: 'studentId' },
            { path: 'course', select: 'name code' },
            { path: 'teacher', select: 'firstName lastName email' }
        ]);
        res.status(200).json(updatedAttendance);
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc     Delete an attendance record
// @route    DELETE /api/attendance/:id
// @access   Private/Admin, Teacher
const deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Teacher specific authorization
        if (req.user.role === 'teacher') {
            const isTeacherAllowed = await teacherTeachesCourse(req.user._id, attendance.course); // Handles null course
            if (!isTeacherAllowed) {
                return res.status(403).json({ message: 'Not authorized to delete this attendance record.' });
            }
        }

        await attendance.deleteOne();
        res.status(200).json({ message: 'Attendance record removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc     Get attendance for the logged-in student
// @route    GET /api/students/me/attendance
// @access   Private/Student
const getMyAttendance = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }

        const attendanceRecords = await Attendance.find({ student: student._id })
            .populate('course', 'name code')
            .sort({ date: -1 });

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export {
    getAttendance,
    getAttendanceById,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    getMyAttendance,
};