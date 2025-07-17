// server/controllers/enrollmentController.js (or similar)
import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

// @desc    Enroll a student in a course
// @route   POST /api/enrollments/enroll
// @access  Private/Admin (or Teacher who owns the course)
const enrollStudentInCourse = asyncHandler(async (req, res) => {
    const { studentId, courseId } = req.body;

    // Input validation
    if (!studentId || !courseId) {
        res.status(400);
        throw new Error('Student ID and Course ID are required for enrollment.');
    }

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student) {
        res.status(404);
        throw new Error('Student not found.');
    }
    if (!course) {
        res.status(404);
        throw new Error('Course not found.');
    }

    // Teacher Authorization Check: A teacher can only enroll students in their own courses
    // 🚨 IMPORTANT: UNCOMMENT THIS FOR SECURITY IF DESIRED
    if (req.user.role === 'teacher') {
        if (!course.teacher || course.teacher.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized. You can only enroll students in courses you teach.');
        }
    }

    // Check if student is already enrolled in THIS COURSE from BOTH sides
    const isStudentEnrolledInCourse = student.enrolledCourses.some(id => id.equals(courseId));
    const isCourseHavingStudent = course.students.some(id => id.equals(studentId));

    if (isStudentEnrolledInCourse && isCourseHavingStudent) {
        // Both sides already consistent and enrolled
        return res.status(200).json({ message: 'Student is already consistently enrolled in this course.' });
    } else if (isStudentEnrolledInCourse || isCourseHavingStudent) {
        // One side is updated, but not the other - indicates inconsistency.
        // We'll proceed to fix it.
        console.warn(`[Enrollment] Detected inconsistent state for Student ${studentId} and Course ${courseId}. Fixing...`);
    }

    // Add course to student's enrolledCourses (if not already there)
    if (!isStudentEnrolledInCourse) {
        student.enrolledCourses.push(courseId);
        await student.save();
    }

    // Add student to course's students array (if not already there)
    if (!isCourseHavingStudent) {
        course.students.push(studentId);
        await course.save();
    }

    res.status(200).json({
        message: 'Student enrollment processed successfully (or consistency restored).',
        student: { _id: student._id, studentId: student.studentId },
        course: { _id: course._id, name: course.name, code: course.code },
    });
});

// @desc    Unenroll a student from a course
// @route   POST /api/enrollments/unenroll
// @access  Private/Admin (or Teacher who owns the course)
const unenrollStudentFromCourse = asyncHandler(async (req, res) => {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
        res.status(400);
        throw new Error('Student ID and Course ID are required for unenrollment.');
    }

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
        res.status(404);
        throw new Error('Student or Course not found');
    }

    // Teacher Authorization Check: A teacher can only unenroll students from their own courses
    // 🚨 IMPORTANT: UNCOMMENT THIS FOR SECURITY IF DESIRED
    if (req.user.role === 'teacher') {
        if (!course.teacher || course.teacher.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized. You can only unenroll students from courses you teach.');
        }
    }

    // Check if student is actually enrolled (from both sides)
    const isStudentEnrolledInCourse = student.enrolledCourses.some(id => id.equals(courseId));
    const isCourseHavingStudent = course.students.some(id => id.equals(studentId));

    if (!isStudentEnrolledInCourse && !isCourseHavingStudent) {
        // Neither side is enrolled, nothing to do
        return res.status(200).json({ message: 'Student is not enrolled in this course (consistency confirmed).' });
    } else if (!isStudentEnrolledInCourse || !isCourseHavingStudent) {
        // Inconsistent state, one side is missing the link. We'll proceed to fix it.
        console.warn(`[Unenrollment] Detected inconsistent state for Student ${studentId} and Course ${courseId}. Fixing...`);
    }

    // Remove course from student's enrolledCourses
    if (isStudentEnrolledInCourse) {
        student.enrolledCourses = student.enrolledCourses.filter(
            (id) => !id.equals(courseId)
        );
        await student.save();
    }

    // Remove student from course's students array
    if (isCourseHavingStudent) {
        course.students = course.students.filter(
            (id) => !id.equals(studentId)
        );
        await course.save();
    }

    res.status(200).json({ message: 'Student unenrollment processed successfully (or consistency restored).' });
});

export {
    enrollStudentInCourse,
    unenrollStudentFromCourse,
};