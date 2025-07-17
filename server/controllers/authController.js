// server/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with that email already exists' });
        }

        // Create new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password, // Password hashing happens in the User model's pre-save hook
            role: role || 'student', // Default to 'student' if not provided
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        console.log('Login attempt: Missing email or password.');
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    console.log('--- Login Attempt ---');
    console.log('Received email:', email);
    // DO NOT LOG PLAIN PASSWORD IN PRODUCTION. Masking for debugging:
    console.log('Received password (masked): ****');

    try {
        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`Login failed for email "${email}": User not found.`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        console.log(`User found for email "${email}". Checking password...`);

        const isMatch = await user.matchPassword(password);
        console.log(`Password match result for "${email}": ${isMatch}`);

        if (isMatch) {
            console.log(`Login successful for user: ${user.email}`);
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            console.log(`Login failed for email "${email}": Password does not match.`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login process:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export { registerUser, loginUser };