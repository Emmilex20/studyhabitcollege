// server/controllers/courseController.js

import mongoose from 'mongoose';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all courses (filters based on user role)
// @route   GET /api/courses
// @access  Private (Admin, Teacher, Student, Parent)
const getCourses = asyncHandler(async (req, res) => {
    let query = {};
    const userRole = req.user.role;
    const userId = req.user._id;

    console.log(`[getCourses] User Role: ${userRole}, User ID: ${userId}`);

    if (userRole === 'teacher') {
        query.teacher = userId;
        console.log(`[getCourses] Teacher query: ${JSON.stringify(query)}`);
    } else if (userRole === 'student') {
        const studentProfile = await Student.findOne({ user: userId }).select('enrolledCourses');
        if (!studentProfile) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }
        query._id = { $in: studentProfile.enrolledCourses || [] };
        console.log(`[getCourses] Student query: ${JSON.stringify(query)}`);
    } else if (userRole === 'parent') {
        const children = await Student.find({ parent: userId }).select('enrolledCourses');
        const courseIds = children.flatMap(child => child.enrolledCourses || []);
        query._id = { $in: courseIds };
        console.log(`[getCourses] Parent query: ${JSON.stringify(query)}`);
    }
    // For 'admin' role, query remains empty, fetching all courses

    const courses = await Course.find(query)
        .populate('teacher', 'firstName lastName email role')
        .populate({
            path: 'students',
            model: 'Student',
            populate: {
                path: 'user',
                model: 'User',
                select: 'firstName lastName email'
            },
            select: 'studentId user'
        });

    console.log(`[getCourses] Found ${courses.length} courses.`);
    res.status(200).json(courses);
});

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('teacher', 'firstName lastName email')
        .populate({
            path: 'students',
            model: 'Student',
            populate: {
                path: 'user',
                model: 'User',
                select: 'firstName lastName email'
            },
            select: 'studentId user'
        });

    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Authorization check: Ensure only authorized users can view details
    if (req.user.role === 'admin') {
        // Admin can view any course
    } else if (req.user.role === 'teacher') {
        if (course.teacher && course.teacher._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this course.');
        }
    } else if (req.user.role === 'student') {
        const studentProfile = await Student.findOne({ user: req.user._id });
        if (!studentProfile || !studentProfile.enrolledCourses.includes(course._id)) {
            res.status(403);
            throw new Error('Not authorized to view this course.');
        }
    } else if (req.user.role === 'parent') {
        const children = await Student.find({ parent: req.user._id }).select('enrolledCourses');
        const courseIds = children.flatMap(child => child.enrolledCourses.map(id => id.toString()));
        if (!courseIds.includes(course._id.toString())) {
            res.status(403);
            throw new Error('Not authorized to view this course.');
        }
    } else {
        res.status(403);
        throw new Error('Not authorized to view this course.');
    }

    res.status(200).json(course);
});


// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
    // Destructure yearLevel and term as arrays
    const { name, code, description, teacher, yearLevel, academicYear, term } = req.body;

    // Validate that yearLevel and term are arrays and not empty if required
    if (!name || !code || !yearLevel || !Array.isArray(yearLevel) || yearLevel.length === 0) {
        return res.status(400).json({ message: 'Please enter all required course fields including at least one year level.' });
    }
    // You might want to add a similar check for `term` if it's strictly required to be an array and not empty
    // if (!term || !Array.isArray(term) || term.length === 0) {
    //     return res.status(400).json({ message: 'Please select at least one term.' });
    // }

    const courseExists = await Course.findOne({ $or: [{ name }, { code }] });
    if (courseExists) {
        return res.status(400).json({ message: 'Course with this name or code already exists' });
    }

    let assignedTeacher = null;
    if (teacher) {
        const existingTeacher = await User.findOne({ _id: teacher, role: 'teacher' });
        if (!existingTeacher) {
            return res.status(400).json({ message: 'Provided teacher ID is invalid or not a teacher' });
        }
        assignedTeacher = existingTeacher._id;
    }

    const course = new Course({
        name,
        code,
        description,
        teacher: assignedTeacher,
        yearLevel, // This will now be an array
        academicYear,
        term, // This will now be an array
        students: [], // Initialize with an empty array
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
    // Destructure yearLevel and term as arrays
    const { name, code, description, teacher, yearLevel, academicYear, term, students } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    let assignedTeacher = course.teacher;
    if (teacher !== undefined) {
        if (!teacher) { // Allow unassigning a teacher (if null or empty string is sent)
            assignedTeacher = null;
        } else {
            const existingTeacher = await User.findOne({ _id: teacher, role: 'teacher' });
            if (!existingTeacher) {
                res.status(400);
                throw new Error('Provided teacher ID is invalid or not a teacher');
            }
            assignedTeacher = existingTeacher._id;
        }
    }

    course.name = name !== undefined ? name : course.name;
    course.code = code !== undefined ? code : course.code;
    course.description = description !== undefined ? description : course.description;
    course.teacher = assignedTeacher;

    // Assign arrays directly
    // Add validation to ensure they are arrays before assigning, if you're not absolutely sure the frontend sends arrays
    if (yearLevel !== undefined) {
        if (!Array.isArray(yearLevel)) {
            res.status(400);
            throw new Error('yearLevel must be an array.');
        }
        course.yearLevel = yearLevel;
    }

    course.academicYear = academicYear !== undefined ? academicYear : course.academicYear;

    if (term !== undefined) {
        if (!Array.isArray(term)) {
            res.status(400);
            throw new Error('term must be an array.');
        }
        course.term = term;
    }


    // Handle students array updates: This is crucial for adding/removing students
    if (students !== undefined && Array.isArray(students)) {
        // You might want to add validation here to ensure the student IDs are valid and exist
        course.students = students.map(s => new mongoose.Types.ObjectId(s)); // Ensure ObjectIds
    } else if (students !== undefined && !Array.isArray(students)) {
        res.status(400);
        throw new Error('students must be an array.');
    }


    const updatedCourse = await course.save();
    res.status(200).json(updatedCourse);
});


// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (course) {
        res.status(200).json({ message: 'Course removed' });
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Get total count of courses
// @route   GET /api/courses/count
// @access  Private/Admin
const getCourseCount = asyncHandler(async (req, res) => {
    const count = await Course.countDocuments({});
    res.status(200).json({ count });
});

export {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseCount,
};