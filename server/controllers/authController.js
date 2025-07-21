// server/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing in resetPassword
import crypto from 'crypto'; // Node.js built-in module for token generation
import sendEmail from '../utils/sendEmail.js'; // Import the email utility

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

// @desc    Forgot Password - Send reset link to user's email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    console.log(`[authController:forgotPassword] Request received for email: ${email}`);

    // Basic validation
    if (!email) {
        console.warn('[authController:forgotPassword] Missing email in request.');
        return res.status(400).json({ message: 'Please provide an email address.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // Send a generic success message even if user not found to prevent email enumeration
            console.warn(`[authController:forgotPassword] User with email ${email} not found, but sending generic success message.`);
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex'); // This is the plain token sent in the URL
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // This is the hashed token stored in DB
        const passwordResetExpires = Date.now() + 3600000; // Token valid for 1 hour (3600000 ms)

        user.passwordResetToken = passwordResetToken;
        user.passwordResetExpires = passwordResetExpires;
        await user.save({ validateBeforeSave: false }); // Bypass schema validation for these temporary fields

        // Create reset URL
        // Ensure FRONTEND_URL is set in your .env file
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to reset your password:\n\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged. This link is valid for 1 hour.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request for StudyHabit College',
                message,
            });

            console.log(`[authController:forgotPassword] Password reset email sent successfully to ${user.email}.`);
            res.status(200).json({
                message: 'Password reset link sent to your email!',
            });
        } catch (err) {
            // If email sending fails, clear the token from the user
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            console.error('[authController:forgotPassword] Error sending email:', err);
            res.status(500).json({ message: 'There was an error sending the email. Try again later.' });
        }
    } catch (error) {
        console.error('[authController:forgotPassword] Server error during forgot password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    console.log(`[authController:resetPassword] Request received for token: ${token}`);

    // Basic validation
    if (!password) {
        console.warn('[authController:resetPassword] Missing new password in request.');
        return res.status(400).json({ message: 'Please provide a new password.' });
    }

    if (password.length < 6) {
        console.warn('[authController:resetPassword] New password too short.');
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        // Hash the token received from the URL to compare with the stored hashed token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        console.log(`[authController:resetPassword] Hashed token for lookup: ${hashedToken}`);

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }, // Check if token is not expired
        });

        if (!user) {
            console.warn(`[authController:resetPassword] Invalid or expired token received.`);
            return res.status(400).json({ message: 'Token is invalid or has expired. Please request a new password reset.' });
        }

        // Set the new password, which will be hashed by the pre-save hook in the User model
        user.password = password;
        user.passwordResetToken = undefined; // Clear the token
        user.passwordResetExpires = undefined; // Clear the expiry

        console.log(`[authController:resetPassword] User found, resetting password for ${user.email}.`);
        await user.save(); // This will trigger the pre('save') hook to hash the new password

        console.log(`[authController:resetPassword] Password reset successful for ${user.email}.`);
        res.status(200).json({
            message: 'Password reset successful. You can now log in with your new password.',
            // Optionally, you could log them in automatically:
            // token: generateToken(user._id),
            // user: { _id: user._id, firstName: user.firstName, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('[authController:resetPassword] Server error during password reset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
};