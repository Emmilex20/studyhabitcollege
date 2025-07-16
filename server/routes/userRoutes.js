// server/routes/userRoutes.js
import express from 'express';
import { protect, authorizeRoles  } from '../middleware/authMiddleware.js';
// We'll add a controller for getting profile, for now, we can just return req.user
import {
    getUserProfile,
    getAllUsers,
    updateUser,
    deleteUser 
} from '../controllers/userController.js';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
// Protected profile route
router.get('/profile', protect, getUserProfile);

// Admin-only route to get all users
router.get('/', protect, authorizeRoles('admin'), getAllUsers); 

router.route('/:id')
  .put(protect, authorizeRoles('admin'), updateUser)
  .delete(protect, authorizeRoles('admin'), deleteUser);

export default router;