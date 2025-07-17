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
        ref: 'User', // User who created/organized the event (e.g., Admin)
        required: true,
    },
    targetAudience: {
        type: [String], // Array of strings for different roles/groups
        default: ['all'],
        enum: ['all', 'students', 'teachers', 'parents', 'JSS1', 'SS2', 'Year 7'], // Example enums, extend as needed
    },
    course: { // ✨ ADDED THIS FIELD to link events/deadlines to courses
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: false, // Not all events are course-specific (e.g., general school events)
    },
}, {
    timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

export default Event;