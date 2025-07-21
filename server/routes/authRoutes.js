// server/routes/authRoutes.js
import express from 'express';
import {
    registerUser,
    loginUser,
    forgotPassword, // Import new functions
    resetPassword,  // Import new functions
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword); // Route for initiating password reset
router.put('/reset-password/:token', resetPassword); // Route for setting new password with token

export default router;