// server/controllers/userController.js

import User from '../models/User.js';
import asyncHandler from 'express-async-handler'; // Import asyncHandler
import bcrypt from 'bcryptjs'; // Needed for password changes, if you add that here later (though often in a separate profile route)

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const filter = {};

    // If there's a role query like ?role=teacher, filter by it
    if (req.query.role) {
        filter.role = req.query.role;
    }

    // Find users based on the filter and exclude their passwords
    const users = await User.find(filter).select('-password');
    res.status(200).json(users);
});

// @desc    Get user profile (for the currently logged-in user)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user is populated by the protect middleware
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            // Include token here if you resend it on profile fetch, otherwise not needed
            // token: req.user.token,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile (for the currently logged-in user)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    // This is for a user updating THEIR OWN profile (from settings page)
    const user = await User.findById(req.user._id);

    if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;

        // Handle email change: check if it's different and if the new email is already taken
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                res.status(400);
                throw new Error('Email already taken by another account.');
            }
            user.email = req.body.email;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            token: req.user.token, // Re-send the token to update client-side context if needed
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


// @desc    Change user password (for the currently logged-in user)
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { currentPassword, newPassword } = req.body;

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check current password using a method on your User model (e.g., user.matchPassword)
    const isMatch = await user.matchPassword(currentPassword); // Assumes you have this method
    if (!isMatch) {
        res.status(401); // Unauthorized
        throw new Error('Invalid current password');
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
});


// @desc    Update user profile by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    // This is for ADMIN updating ANY user's profile
    const { firstName, lastName, email, role } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.firstName = firstName !== undefined ? firstName : user.firstName;
            user.lastName = lastName !== undefined ? lastName : user.lastName;

            // Handle email change: check if it's different and if the new email is already taken
            if (email !== undefined && email !== user.email) {
                const emailExists = await User.findOne({ email: email });
                if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                    res.status(400);
                    throw new Error('Email already taken by another user.');
                }
                user.email = email;
            }

            // Admin can change role
            // Prevent an admin from demoting themselves (optional but recommended)
            if (role !== undefined) {
                if (req.user._id.toString() === user._id.toString() && role !== 'admin') {
                    res.status(400);
                    throw new Error('Admin cannot demote their own account.');
                }
                user.role = role;
            }

            const updatedUser = await user.save();
            res.status(200).json({
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404);
            throw new new Error('User not found'); // Corrected from `new Error`
        }
    } catch (error) {
        console.error(error);
        if (error.code === 11000) { // Duplicate email error from MongoDB
            return res.status(400).json({ message: 'Email already registered.' });
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Prevent admin from deleting themselves
        if (req.user._id.toString() === user._id.toString()) {
            res.status(400);
            throw new Error('Cannot delete your own admin account.');
        }

        // TODO: Future enhancement: If deleting a student/teacher/parent, consider also deleting their associated records
        // (Student profile, Grades, Attendance, etc.) or set a 'isActive: false' flag instead of hard delete.
        await user.deleteOne();
        res.status(200).json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export {
    getAllUsers,
    getUserProfile,
    updateUserProfile, // Added for users to update their own profile
    changePassword,     // Added for users to change their own password
    updateUser,         // For admin to update any user by ID
    deleteUser,
};