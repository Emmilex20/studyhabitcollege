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

    console.log('--- Register User Request Initiated ---');
    console.log(`[authController:register] Attempting to register email: ${email}`);

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
        console.warn('[authController:register] Missing fields in registration request.');
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.warn(`[authController:register] User with email ${email} already exists.`);
            return res.status(400).json({ message: 'User with that email already exists' });
        }

        // Create new user
        // Password hashing happens in the User model's pre-save hook
        console.log(`[authController:register] Creating new user for email: ${email}`);
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: role || 'student', // Default to 'student' if not provided
        });

        if (user) {
            console.log(`[authController:register] User registered successfully: ${user.email}`);
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            console.error('[authController:register] Invalid user data provided during creation.');
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('[authController:register] Error during user registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log('--- Login Attempt Initiated ---');
    console.log(`[authController:login] Received email: ${email}`);
    console.log(`[authController:login] Received password (masked): ${password ? '****' : 'empty'}`);

    // Basic validation
    if (!email || !password) {
        console.warn('[authController:login] Missing email or password in login request.');
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user exists
        console.log(`[authController:login] Attempting to find user by email: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.warn(`[authController:login] Login failed for email "${email}": User not found.`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        console.log(`[authController:login] User found for email "${email}". Calling user.matchPassword...`);

        // Use the matchPassword method from the User model
        const isMatch = await user.matchPassword(password);
        console.log(`[authController:login] Password match result for "${email}": ${isMatch}`);

        if (isMatch) {
            console.log(`[authController:login] Login successful for user: ${user.email}`);
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            console.warn(`[authController:login] Login failed for email "${email}": Password does not match.`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('[authController:login] Error during login process:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export { registerUser, loginUser };