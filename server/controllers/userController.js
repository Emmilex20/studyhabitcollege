// server/controllers/userController.js

import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import Course from '../models/Course.js';
import Student from '../models/Student.js';

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
    const { currentPassword, newPassword } = req.body;

    if (!req.user || !req.user._id) {
        console.error('[userController] Error: Not authorized, no user ID found in token.');
        res.status(401);
        throw new Error('Not authorized, no user ID found in token.');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        console.error(`[userController] Error: User not found for ID: ${req.user._id}`);
        res.status(404);
        throw new Error('User not found');
    }
    console.log(`[userController] User found in DB: ${user.email}`);

    // Check current password using a method on your User model (e.g., user.matchPassword)
    console.log('[userController] Calling user.matchPassword to verify current password...');
    const isMatch = await user.matchPassword(currentPassword);
    console.log(`[userController] Current password match result (isMatch): ${isMatch}`);

    if (!isMatch) {
        console.warn(`[userController] Invalid current password provided for user: ${user.email}`);
        res.status(401); // Unauthorized
        throw new Error('Invalid current password'); // This is the error message sent to frontend
    }

    // ⭐ CRITICAL CHANGE HERE: Assign the plain newPassword to user.password.
    // The pre('save') hook in User.js will then hash this plain password.
    console.log('[userController] Assigning plain newPassword to user.password. The pre-save hook will hash it.');
    user.password = newPassword; // Assign the plain new password here, NOT the hashed one

    console.log(`[userController] Starting user.save()...`);
    // The pre('save') hook will now correctly detect the modification and hash it once.
    await user.save();
    console.log(`[userController] Password updated successfully for user: ${user.email}`);
    res.status(200).json({ message: 'Password updated successfully' });
});


// @desc    Update user profile by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    // This is for ADMIN updating ANY user's profile
    const { firstName, lastName, email, role } = req.body;

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
        throw new Error('User not found');
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

const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments(); // Counts all documents in the User collection
    res.status(200).json({ count });
  } catch (error) {
    console.error(`Error fetching user count: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not retrieve user count.' });
  }
};

const getTeacherCourseCount = async (req, res) => {
    try {
        // req.user is populated by your protect middleware
        const teacherId = req.user._id;

        const courseCount = await Course.countDocuments({ teacher: teacherId });

        res.status(200).json({ count: courseCount });
    } catch (error) {
        console.error('Error fetching teacher course count:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get count of students taught by the authenticated teacher
// @route   GET /api/users/teacher/students/count
// @access  Private (Teacher only)
const getTeacherStudentCount = asyncHandler(async (req, res) => {
    const teacherId = req.user._id;

    // 1. Find all courses taught by this teacher
    const coursesTaught = await Course.find({ teacher: teacherId }).select('_id'); // Only need course IDs

    const uniqueStudentIds = new Set();

    if (coursesTaught.length > 0) {
        const courseIds = coursesTaught.map(course => course._id);

        // Find all Student documents whose 'enrolledCourses' array contains any of the teacher's course IDs
        // Assuming a separate Student model with an 'enrolledCourses' array
        const students = await Student.find({
            enrolledCourses: { $in: courseIds }
        }).select('user'); // Select the 'user' field which points to the User model

        // Collect unique User _ids associated with these students
        students.forEach(student => {
            if (student.user) {
                uniqueStudentIds.add(student.user.toString());
            }
        });
    }

    res.status(200).json({ count: uniqueStudentIds.size });
});


export {
    getAllUsers,
    getUserProfile,
    updateUserProfile,
    changePassword,
    updateUser,
    deleteUser,
    getUserCount,
    getTeacherCourseCount,
    getTeacherStudentCount,
};