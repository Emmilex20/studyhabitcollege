// server/controllers/studentController.js
import Student from '../models/Student.js';
import User from '../models/User.js'; // To check if user exists and is student/parent
import Course from '../models/Course.js'; // To check if courses exist
import Event from '../models/Event.js';
import Grade from '../models/Grade.js';
import Attendance from '../models/Attendance.js'; // Assuming you have an Attendance model
import mongoose from 'mongoose'; // Import mongoose for transactions
import asyncHandler from 'express-async-handler'; // For handling async errors

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin, Teacher (for their students), Parent (for their children)
const getStudents = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === 'teacher') {
        // Find all courses taught by this teacher
        const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
        const courseIds = teacherCourses.map(course => course._id);

        // Find students who are enrolled in any of these courses
        query.enrolledCourses = { $in: courseIds };
    } else if (req.user.role === 'parent') {
        // Find students where this parent is assigned
        query.parent = req.user._id; // Corrected: parent field directly stores User ObjectId
    }

    const students = await Student.find(query)
        .populate('user', 'firstName lastName email gender dateOfBirth phoneNumber address role')
        .populate('enrolledCourses', 'name code') // Populate course names/codes
        .populate('parent', 'firstName lastName email'); // Correct

    res.status(200).json(students);
});

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private/Admin, Teacher (for their student), Parent (for their child)
const getStudentById = asyncHandler(async (req, res) => {
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
});

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
    const { userId, studentId, dateOfBirth, gender, currentClass, enrolledCourses, parentId } = req.body;

    if (!userId || !studentId || !dateOfBirth || !gender) {
        return res.status(400).json({ message: 'Please enter all required student fields' });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if a User with the given userId exists and has a 'student' role
        const user = await User.findById(userId).session(session);
        if (!user || user.role !== 'student') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Invalid User ID provided, or user is not a student.' });
        }

        // Check if studentId is unique
        const studentExists = await Student.findOne({ studentId }).session(session);
        if (studentExists) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Student with this ID already exists.' });
        }

        // Check if a student record already exists for this user
        const existingStudentRecord = await Student.findOne({ user: userId }).session(session);
        if (existingStudentRecord) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'A student record already exists for this user.' });
        }

        // Validate enrolledCourses (optional, but good practice)
        const validCourses = [];
        if (enrolledCourses && enrolledCourses.length > 0) {
            for (const courseId of enrolledCourses) {
                const course = await Course.findById(courseId).session(session);
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
            const parentUser = await User.findOne({ _id: parentId, role: 'parent' }).session(session);
            if (!parentUser) {
                await session.abortTransaction();
                session.endSession();
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

        const createdStudent = await student.save({ session });

        // Update each enrolled course's student list
        for (const courseId of validCourses) {
            const course = await Course.findById(courseId).session(session);
            if (course && !course.students.includes(createdStudent._id)) {
                course.students.push(createdStudent._id);
                await course.save({ session });
            }
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(createdStudent);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: 'Server error: Failed to create student.' });
    }
});

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = asyncHandler(async (req, res) => {
    const { userId, studentId, dateOfBirth, gender, currentClass, enrolledCourses, parentId } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const student = await Student.findById(req.params.id).session(session);

        if (!student) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Student not found' });
        }

        // Ensure userId is not changed if it refers to another user
        if (userId && student.user.toString() !== userId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Cannot change student record to another user ID' });
        }

        // Store old enrolled courses to compare
        const oldEnrolledCourses = [...student.enrolledCourses];

        let updatedEnrolledCourses = student.enrolledCourses;
        if (enrolledCourses && Array.isArray(enrolledCourses)) {
            const validCourses = [];
            for (const courseId of enrolledCourses) {
                const course = await Course.findById(courseId).session(session);
                if (course) {
                    validCourses.push(course._id);
                } else {
                    console.warn(`Course with ID ${courseId} not found during update, skipping.`);
                }
            }
            updatedEnrolledCourses = validCourses;
        }

        let updatedParent = student.parent;
        if (parentId !== undefined) {
            if (parentId === null || parentId === '') {
                updatedParent = null;
            } else {
                const parentUser = await User.findOne({ _id: parentId, role: 'parent' }).session(session);
                if (!parentUser) {
                    await session.abortTransaction();
                    session.endSession();
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

        const updatedStudent = await student.save({ session });

        // Sync courses (add student to new courses, remove from old ones)
        const coursesToAddStudentTo = updatedEnrolledCourses.filter(
            (courseId) => !oldEnrolledCourses.some(oldId => oldId.equals(courseId))
        );
        const coursesToRemoveStudentFrom = oldEnrolledCourses.filter(
            (oldId) => !updatedEnrolledCourses.some(newId => newId.equals(oldId))
        );

        for (const courseId of coursesToAddStudentTo) {
            const course = await Course.findById(courseId).session(session);
            if (course && !course.students.includes(updatedStudent._id)) {
                course.students.push(updatedStudent._id);
                await course.save({ session });
            }
        }

        for (const courseId of coursesToRemoveStudentFrom) {
            const course = await Course.findById(courseId).session(session);
            if (course) {
                course.students = course.students.filter(
                    (studentRefId) => !studentRefId.equals(updatedStudent._id)
                );
                await course.save({ session });
            }
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(updatedStudent);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: 'Server error: Failed to update student.' });
    }
});

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const student = await Student.findById(req.params.id).session(session);

        if (!student) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Student not found' });
        }

        // Remove student's reference from all courses they were enrolled in
        await Course.updateMany(
            { students: student._id },
            { $pull: { students: student._id } },
            { session }
        );

        // Delete associated grades and attendance records (optional, but good practice)
        await Grade.deleteMany({ student: student._id }).session(session);
        await Attendance.deleteMany({ student: student._id }).session(session);

        // Delete the student record itself
        await student.deleteOne({ session }); // Use deleteOne with session

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Student and associated records removed successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: 'Server error: Failed to delete student.' });
    }
});

// @desc    Enroll a student in a course
// @route   POST /api/students/:studentId/enroll
// @access  Private/Admin
const enrollStudentInCourse = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { courseId } = req.body;

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const student = await Student.findById(studentId).session(session);
        const course = await Course.findById(courseId).session(session);

        if (!student) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Student not found.' });
        }

        if (!course) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Check if student is already enrolled in the course
        if (student.enrolledCourses.includes(courseId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Student is already enrolled in this course.' });
        }

        // Add course to student's enrolledCourses
        student.enrolledCourses.push(courseId);
        await student.save({ session });

        // Add student to course's students list
        course.students.push(studentId);
        await course.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'Student enrolled successfully! 🎉',
            student,
            course,
        });
    } catch (error) {
        // If any error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        console.error('Error during enrollment:', error);
        res.status(500).json({ message: 'Failed to enroll student.', error: error.message });
    }
});

// @desc    Unenroll a student from a course
// @route   DELETE /api/students/:studentId/unenroll
// @access  Private/Admin
const unenrollStudentFromCourse = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { courseId } = req.body; // Expect courseId in body for DELETE

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const student = await Student.findById(studentId).session(session);
        const course = await Course.findById(courseId).session(session);

        if (!student) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Student not found.' });
        }

        if (!course) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Check if student is actually enrolled in the course
        if (!student.enrolledCourses.includes(courseId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Student is not enrolled in this course.' });
        }

        // Remove course from student's enrolledCourses
        student.enrolledCourses = student.enrolledCourses.filter(
            (c) => c.toString() !== courseId
        );
        await student.save({ session });

        // Remove student from course's students list
        course.students = course.students.filter(
            (s) => s.toString() !== studentId
        );
        await course.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'Student unenrolled successfully! 👋',
            student,
            course,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error during unenrollment:', error);
        res.status(500).json({ message: 'Failed to unenroll student.', error: error.message });
    }
});


// @desc    Get courses for logged-in student
// @route   GET /api/student/me/courses
// @access  Private/Student
const getMyCourses = asyncHandler(async (req, res) => {
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
});

// @desc    Get all children linked to the authenticated parent
// @route   GET /api/parent/me/children
// @access  Private (Parent)
const getMyChildren = asyncHandler(async (req, res) => {
    // req.user._id is the ObjectId of the Parent User
    // Find students where the 'parent' field matches the logged-in parent's user ID
    const children = await Student.find({ parent: req.user._id }) // Corrected: Use 'parent' field directly
        .populate('user', 'firstName lastName email gender dateOfBirth studentId') // Populate child's user details
        .populate('enrolledCourses', 'name code') // Optionally populate enrolled courses for overview
        .select('-academicRecords -attendanceRecords -grades -messages'); // Exclude sensitive details not needed in overview

    if (!children || children.length === 0) {
        return res.status(200).json([]);
    }

    // Map children to include avatarUrl from their user profile if available, and calculate gradeAverage/attendancePercentage
    const childrenWithDetails = await Promise.all(children.map(async (child) => {
        const user = await User.findById(child.user).select('avatarUrl').lean(); // Fetch user for avatarUrl
        const grades = await Grade.find({ student: child._id }).populate('course', 'credits');
        const attendanceRecords = await Attendance.find({ student: child._id });

        let totalGradePoints = 0;
        let totalCredits = 0;
        let totalPresent = 0;
        let totalSessions = 0;

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
        const gradeAverage = parseFloat((overallGPA * 25).toFixed(2)); // Rough conversion for dashboard display (e.g., 4.0 * 25 = 100%)

        for (const record of attendanceRecords) {
            totalSessions += 1; // Assuming each record is one session
            if (record.status === 'Present') {
                totalPresent += 1;
            }
        }
        const attendancePercentage = totalSessions > 0 ? parseFloat(((totalPresent / totalSessions) * 100).toFixed(2)) : 0;

        return {
            _id: child._id,
            firstName: child.user?.firstName, // Use optional chaining in case user isn't fully populated
            lastName: child.user?.lastName,
            studentId: child.studentId,
            gradeAverage: gradeAverage, // Calculated average
            attendancePercentage: attendancePercentage, // Calculated percentage
            avatarUrl: user?.avatarUrl, // Avatar URL from the User document
        };
    }));

    res.status(200).json(childrenWithDetails);
});

// @desc    Get grades for a specific child linked to the authenticated parent
// @route   GET /api/parent/child/:studentId/grades
// @access  Private (Parent)
const getChildGrades = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // 1. Validate studentId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: 'Invalid student ID format.' });
    }

    // 2. Verify the requested student is indeed a child of the authenticated parent
    const child = await Student.findOne({ _id: studentId, parent: req.user._id }); // Corrected: Use 'parent' field directly

    if (!child) {
        return res.status(404).json({ message: 'Child not found or not linked to this parent.' });
    }

    // 3. Fetch grades for this child
    // Assuming Grade model has a 'student' field that references the Student model
    const grades = await Grade.find({ student: child._id })
        .populate('course', 'name code') // Populate course name and code
        .select('-__v'); // Exclude mongoose version key

    res.status(200).json(grades);
});

// @desc    Get attendance for a specific child linked to the authenticated parent
// @route   GET /api/parent/child/:studentId/attendance
// @access  Private (Parent)
const getChildAttendance = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // 1. Validate studentId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: 'Invalid student ID format.' });
    }

    // 2. Verify the requested student is indeed a child of the authenticated parent
    const child = await Student.findOne({ _id: studentId, parent: req.user._id }); // Corrected: Use 'parent' field directly

    if (!child) {
        return res.status(404).json({ message: 'Child not found or not linked to this parent.' });
    }

    // 3. Fetch attendance records for this child
    // Assuming Attendance model has a 'student' field that references the Student model
    const attendance = await Attendance.find({ student: child._id })
        .populate('course', 'name code') // Populate course name and code
        .select('-__v');

    res.status(200).json(attendance);
});


// @desc    Get announcements relevant to the authenticated parent
// @route   GET /api/parent/me/announcements
// @access  Private (Parent)
const getParentAnnouncements = asyncHandler(async (req, res) => {
    // Announcements targeted to 'all', 'parents', or 'parent' role specifically
    const announcements = await Announcement.find({
        targetAudience: { $in: ['all', 'parents'] } // Adjust based on your audience definitions
    })
    .populate('postedBy', 'firstName lastName') // Assuming postedBy is a User ID
    .sort({ datePosted: -1 });

    res.status(200).json(announcements);
});

// @desc    Get events relevant to the authenticated parent
// @route   GET /api/parent/me/events
// @access  Private (Parent)
const getParentEvents = asyncHandler(async (req, res) => {
    // Events targeted to 'all', 'parents', or 'parent' role specifically, and not yet ended
    const events = await Event.find({
        targetAudience: { $in: ['all', 'parents'] }, // Adjust based on your audience definitions
        eventDate: { $gte: new Date() } // Only future events
    })
    .sort({ eventDate: 1 });

    res.status(200).json(events);
});

// @desc    Get overall GPA for the logged-in student
// @route   GET /api/student/me/gpa
// @access  Private/Student
// Function to determine letter grade from a 4.0 scale GPA
const getLetterGradeFromGPA = (gpa) => {
    if (gpa >= 3.85) return 'A+';
    if (gpa >= 3.5) return 'A';
    if (gpa >= 3.15) return 'A-';
    if (gpa >= 2.85) return 'B+';
    if (gpa >= 2.5) return 'B';
    if (gpa >= 2.15) return 'B-';
    if (gpa >= 1.85) return 'C+';
    if (gpa >= 1.5) return 'C';
    if (gpa >= 1.15) return 'C-';
    if (gpa >= 0.85) return 'D+';
    if (gpa >= 0.5) return 'D';
    if (gpa >= 0.15) return 'D-';
    return 'F';
};

const getStudentGPA = asyncHandler(async (req, res) => {
    // Find the student record linked to the current logged-in user
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
        return res.status(404).json({ message: 'Student profile not found.' });
    }

    // Fetch all grades for this student
    const grades = await Grade.find({ student: student._id }).populate('course', 'credits');

    let totalGradePoints = 0;
    let totalCredits = 0;

    if (grades.length === 0) {
        // Return 'F' for no grades to indicate a failing academic standing initially
        return res.json({ gpa: 0.0, letterGrade: 'F', message: 'No grades recorded yet.' });
    }

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
    // Use the helper function here to get the letter grade
    const overallLetterGrade = getLetterGradeFromGPA(overallGPA);

    res.status(200).json({
        gpa: parseFloat(overallGPA.toFixed(2)), // GPA rounded to 2 decimal places
        letterGrade: overallLetterGrade // The calculated letter grade
    });
});

// @desc    Get count of courses for the logged-in student
// @route   GET /api/student/me/courses/count
// @access  Private/Student
const getMyCoursesCount = asyncHandler(async (req, res) => {
    // Find the student record linked to the current logged-in user
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
        // If student profile is not found, they have 0 enrolled courses from a student perspective
        return res.status(200).json({ count: 0, message: 'Student profile not found, so no courses linked.' });
    }

    // The 'enrolledCourses' field in the Student model should contain an array of Course ObjectIDs
    const courseCount = student.enrolledCourses.length;

    res.status(200).json({ count: courseCount });
});

// @desc    Get upcoming deadlines for the logged-in student
// @route   GET /api/student/me/deadlines
// @access  Private/Student
const getUpcomingDeadlines = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user._id }).populate('user', 'yearLevel'); // Populate user to get student's yearLevel

    if (!student) {
        return res.status(404).json({ message: 'Student profile not found.' });
    }

    // Get the IDs of courses the student is enrolled in
    const enrolledCourseIds = student.enrolledCourses;

    // Determine relevant target audiences for this student
    const studentYearLevel = student.user?.yearLevel?.toLowerCase(); // Assuming yearLevel is on the User model linked to Student
    const targetAudiences = ['all', 'students'];
    if (studentYearLevel) {
        // Add specific year level if applicable (e.g., 'freshmen', 'sophomores')
        targetAudiences.push(studentYearLevel);
    }

    // Find events that are either:
    // 1. Targeted at 'all', 'students', or the student's specific year level.
    // 2. Or, are linked to one of the student's enrolled courses.
    const upcomingDeadlines = await Event.find({
        eventDate: { $gte: new Date() }, // Only future events/deadlines
        $or: [
            { targetAudience: { $in: targetAudiences } },
            { course: { $in: enrolledCourseIds } }
        ]
    })
    .populate('course', 'name code') // Populate course name and code for course-specific deadlines
    .sort({ eventDate: 1 }) // Sort by date, ascending (nearest first)
    .select('title eventDate course'); // Select relevant fields

    // Format deadlines for the frontend
    const formattedDeadlines = upcomingDeadlines.map(deadline => ({
        title: deadline.title,
        // If the deadline is course-specific, use the course name. Otherwise, just the title.
        // You might refine this display logic on the frontend too.
        course: deadline.course ? deadline.course.name : 'General',
        dueDate: deadline.eventDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));


    res.status(200).json({ deadlines: formattedDeadlines });
});

// @desc    Get total count of students
// @route   GET /api/students/count
// @access  Private/Admin
const getStudentCount = asyncHandler(async (req, res) => {
    const count = await Student.countDocuments({});
    res.status(200).json({ count });
});


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
    getMyCoursesCount,
    getUpcomingDeadlines,
    getStudentCount,
    enrollStudentInCourse,   // <--- New export
    unenrollStudentFromCourse // <--- New export
};