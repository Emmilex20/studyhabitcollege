// server/models/Attendance.js
import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    course: { // Can be per course, or general attendance (if null)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null,
    },
    teacher: { // The teacher who recorded attendance, if applicable
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Present', 'Absent', 'Late', 'Excused'],
    },
    remarks: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

// Unique index for attendance on a given day for a student in a course (or general)
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;