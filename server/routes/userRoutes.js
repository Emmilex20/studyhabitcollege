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
    getUserCount,
    getTeacherCourseCount, // Already imported and used in userController
    getTeacherStudentCount, // ⬅️ Now properly imported from userController
} from '../controllers/userController.js';

const router = express.Router();

// Routes for the currently logged-in user's profile
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/change-password', protect, changePassword);

// Admin-only routes
router.get('/', protect, authorizeRoles('admin', 'teacher'), getAllUsers);
router.route('/count').get(protect, authorizeRoles('admin'), getUserCount);

// 🚨 DASHBOARD ROUTES FOR TEACHERS 🚨
// @desc    Get count of courses taught by the authenticated teacher
// @route   GET /api/users/teacher/courses/count
// @access  Private (Teacher only)
router.get('/teacher/courses/count', protect, authorizeRoles('teacher'), getTeacherCourseCount);

// @desc    Get count of students taught by the authenticated teacher
// @route   GET /api/users/teacher/students/count
// @access  Private (Teacher only)
router.get('/teacher/students/count', protect, authorizeRoles('teacher'), getTeacherStudentCount); // ⬅️ Call the controller function directly

// General user management routes (Admin only)
router.route('/:id')
    .put(protect, authorizeRoles('admin'), updateUser)
    .delete(protect, authorizeRoles('admin'), deleteUser);

export default router;