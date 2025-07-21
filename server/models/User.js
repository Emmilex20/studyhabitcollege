// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Ensure bcrypt is imported here

const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true, // Ensure emails are unique
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please fill a valid email address',
            ],
        },
        password: {
            type: String,
            required: true,
        },
        role: { // Student, Parent, Teacher, Admin
            type: String,
            required: true,
            enum: ['student', 'parent', 'teacher', 'admin'], // Enforce specific roles
            default: 'student', // Default role for new registrations
        },
        avatarUrl: {
            type: String,
            required: false, // Not all users might have an avatar
            default: '', // Or a default placeholder URL if you have one
        },
        classesTaught: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course', // Reference the 'Course' model
            },
        ],
        // ✨ NEW FIELDS FOR PASSWORD RESET ✨
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
    }
);

// --- Password Hashing Middleware ---
// This will run before saving a new user or updating a password
userSchema.pre('save', async function (next) {
    console.log(`[User Model:pre('save')] Checking if password is modified...`);
    if (!this.isModified('password')) {
        console.log(`[User Model:pre('save')] Password not modified. Skipping hashing.`);
        return next(); // If password is not modified, move to the next middleware
    }

    console.log(`[User Model:pre('save')] Password modified. Hashing password...`);
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    console.log(`[User Model:pre('save')] Password hashed successfully.`);
    next();
});

// --- Compare Password Method ---
// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    console.log(`[User Model:matchPassword] Comparing entered password with stored hash.`);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log(`[User Model:matchPassword] bcrypt.compare result: ${isMatch}`);
    return isMatch;
};

// Define the User model after defining the schema
const User = mongoose.model('User', userSchema);

export default User;