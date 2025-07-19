// server/models/Event.js
import mongoose from 'mongoose';

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        trim: true,
        default: 'School Premises',
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetAudience: {
        type: [String],
        default: ['all'],
        enum: ['all', 'students', 'teachers', 'parents', 'JSS1', 'SS2', 'Year 7'],
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: false,
    },
    // ✨ NEW: Add imageUrl field ✨
    imageUrl: {
        type: String, // This will store the URL returned by Cloudinary
        required: false, // Event images are optional
    },
}, {
    timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

export default Event;