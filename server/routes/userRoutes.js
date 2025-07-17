// server/routes/userRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserCount
} from '../controllers/userController.js';

// ⬅️ Import necessary models for the new route
import User from '../models/User.js'; // Assuming your User model is in ../models/User.js
import Course from '../models/Course.js'; // Assuming your Course model is in ../models/Course.js

const router = express.Router();

// Routes for the currently logged-in user's profile
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/change-password', protect, changePassword);

// Admin-only routes
router.get('/', protect, authorizeRoles('admin'), getAllUsers);
router.route('/count').get(protect, authorizeRoles('admin'), getUserCount);

// ⬅️ NEW ROUTE FOR TEACHER'S STUDENT COUNT
// @desc    Get count of students taught by the authenticated teacher
// @route   GET /api/users/teacher/students/count
// @access  Private (Teacher only)
router.get('/teacher/students/count', protect, authorizeRoles('teacher'), async (req, res) => {
    try {
        const teacherId = req.user._id; // `req.user` is populated by `protect` middleware

        // Find all courses where this teacher is assigned
        const coursesTaught = await Course.find({ teacher: teacherId });

        const studentIds = new Set();
        for (const course of coursesTaught) {
            // This assumes your Course model has a 'students' array of ObjectId references
            // If your Course model links students differently, adjust 'course.students'
            const studentsInCourse = await User.find({
                _id: { $in: course.students || [] }, // Filter students who are actually linked to this course
                role: 'student' // Ensure only users with 'student' role are counted
            }).select('_id'); // Select only the _id to keep the query light

            studentsInCourse.forEach(student => studentIds.add(student._id.toString()));
        }

        res.status(200).json({ count: studentIds.size });
    } catch (error) {
        console.error(`Error fetching teacher's student count: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// General user management routes (Admin only)
router.route('/:id')
    .put(protect, authorizeRoles('admin'), updateUser)
    .delete(protect, authorizeRoles('admin'), deleteUser);

export default router;