// server/models/Announcement.js
import mongoose from 'mongoose';

const announcementSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // User who created the announcement (e.g., Admin)
        required: true,
    },
    datePublished: {
        type: Date,
        default: Date.now,
    },
    // Optional: Target audience (e.g., 'all', 'students', 'teachers', 'parents', specific classes)
    targetAudience: {
        type: [String], // Array of strings for different roles/groups
        default: ['all'],
        enum: ['all', 'students', 'teachers', 'parents', 'JSS1', 'SS2', 'Year 7'], // Example enums, extend as needed
    },
    expiryDate: {
        type: Date,
        default: null, // Announcement can expire
    },
}, {
    timestamps: true,
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;