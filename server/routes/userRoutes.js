// server/routes/userRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    getUserProfile,
    updateUserProfile, // <--- Import the new function for user's own profile update
    changePassword,    // <--- Import the new function for user's own password change
    getAllUsers,
    updateUser,
    deleteUser
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
    .put(protect, updateUserProfile); // <--- Add PUT for user's own profile update

// @desc    Change user's password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', protect, changePassword); // <--- Add route for password change

// Admin-only routes
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), getAllUsers);

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