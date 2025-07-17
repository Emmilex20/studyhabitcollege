// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
        // Add more fields as needed for specific roles (e.g., studentId, parentId, classesTaught)
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
        next(); // If password is not modified, move to the next middleware
        return; // Important: return after calling next() to prevent further execution
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
    // CAUTION: Only uncomment the line below for very specific debugging in development,
    // NEVER log plain enteredPassword or stored hash in production logs!
    // console.log(`[User Model:matchPassword] Entered: ${enteredPassword} | Stored: ${this.password}`);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log(`[User Model:matchPassword] bcrypt.compare result: ${isMatch}`);
    return isMatch;
};

const User = mongoose.model('User', userSchema);

export default User;