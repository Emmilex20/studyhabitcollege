// server/controllers/userController.js (Create this file if it doesn't exist)
// If you already have one, just add the getAllUsers function

import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const filter = {};

    // If there's a role query like ?role=teacher, filter by it
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter).select('-password'); // Exclude passwords
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// You likely already have getUserProfile here from previous steps
const getUserProfile = async (req, res) => {
    res.json(req.user);
};

// @desc    Update user profile by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    const { firstName, lastName, email, role } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.email = email || user.email;
            user.role = role || user.role; // Admin can change role

            const updatedUser = await user.save();
            res.status(200).json({
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        if (error.code === 11000) { // Duplicate email error
            return res.status(400).json({ message: 'Email already registered.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Prevent admin from deleting themselves
            if (req.user._id.toString() === user._id.toString()) {
                return res.status(400).json({ message: 'Cannot delete your own admin account.' });
            }

            // TODO: Future enhancement: If deleting a student/teacher/parent, consider also deleting their associated records (Student profile, Grades, Attendance, etc.)
            // Or, more robustly, set a 'isActive: false' flag instead of hard delete.

            await user.deleteOne();
            res.status(200).json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


export {
    getAllUsers,
    getUserProfile,
    updateUser, 
    deleteUser,
};