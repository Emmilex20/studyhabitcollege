// server/controllers/enrollmentController.js (or similar)
import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

// @desc    Enroll a student in a course
// @route   POST /api/enrollments/enroll
// @access  Private/Admin (or Teacher who owns the course)
const enrollStudentInCourse = asyncHandler(async (req, res) => {
    const { studentId, courseId } = req.body;

    // 1. Find the student and course
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Optional: Add authorization check if teacher can only enroll students in their own courses
    // if (req.user.role === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
    //     res.status(403);
    //     throw new Error('Not authorized to enroll students in this course.');
    // }

    // 2. Add course to student's enrolledCourses (if not already there)
    if (!student.enrolledCourses.includes(courseId)) {
        student.enrolledCourses.push(courseId);
        await student.save();
    } else {
        return res.status(400).json({ message: 'Student is already enrolled in this course.' });
    }

    // 3. Add student to course's students array (if not already there)
    if (!course.students.includes(studentId)) {
        course.students.push(studentId);
        await course.save();
    }

    res.status(200).json({
        message: 'Student successfully enrolled',
        student: student,
        course: course,
    });
});

// @desc    Unenroll a student from a course
// @route   POST /api/enrollments/unenroll
// @access  Private/Admin (or Teacher who owns the course)
const unenrollStudentFromCourse = asyncHandler(async (req, res) => {
    const { studentId, courseId } = req.body;

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
        res.status(404);
        throw new Error('Student or Course not found');
    }

    // Optional: Authorization check
    // if (req.user.role === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
    //     res.status(403);
    //     throw new Error('Not authorized to unenroll students from this course.');
    // }

    // Remove course from student's enrolledCourses
    student.enrolledCourses = student.enrolledCourses.filter(
        (id) => id.toString() !== courseId.toString()
    );
    await student.save();

    // Remove student from course's students array
    course.students = course.students.filter(
        (id) => id.toString() !== studentId.toString()
    );
    await course.save();

    res.status(200).json({ message: 'Student successfully unenrolled' });
});

export {
    enrollStudentInCourse,
    unenrollStudentFromCourse,
};