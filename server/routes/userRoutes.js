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
    getUserCount // <--- Make sure you import getUserCount here
} from '../controllers/userController.js';

const router = express.Router();

// Routes for the currently logged-in user's profile
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
// @desc    Update user profile (first name, last name, email)
// @route   PUT /api/users/profile
// @access  Private
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// @desc    Change user's password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', protect, changePassword);

// Admin-only routes
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), getAllUsers);

// @desc    Get total user count
// @route   GET /api/users/count
// @access  Private/Admin
router.route('/count').get(protect, authorizeRoles('admin'), getUserCount); // <-- Corrected line

// @desc    Update user by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.route('/:id')
    .put(protect, authorizeRoles('admin'), updateUser)
    .delete(protect, authorizeRoles('admin'), deleteUser);

export default router;