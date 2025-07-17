// server/models/Grade.js
import mongoose from 'mongoose';

const gradeSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignmentName: {
        type: String,
        required: function() {
            // Make assignmentName required only if gradeType is 'Assignment' or 'Project'
            // If you want it always required, just use `required: true`
            return this.gradeType === 'Assignment' || this.gradeType === 'Project';
        },
        trim: true,
    },
    gradeType: {
        type: String,
        required: true,
        enum: ['Test', 'Exam', 'Quiz', 'Assignment', 'Project', 'Midterm', 'Final'],
    },
    score: {
        type: Number,
        required: true,
        min: 0,
    },
    maxScore: { // New field for the maximum possible score
        type: Number,
        required: true,
        default: 100, // Default to 100 if not provided
        min: 1, // Max score must be at least 1
    },
    weight: {
        type: Number,
        default: 1,
        min: 0, // Weight should not be negative
    },
    term: {
        type: String,
        required: true,
        enum: ['First Term', 'Second Term', 'Third Term', 'Semester 1', 'Semester 2', 'Annual'],
    },
    academicYear: {
        type: String,
        required: true,
    },
    dateGraded: { 
        type: Date,
        default: Date.now,
    },
    
    remarks: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true, // This adds createdAt and updatedAt fields automatically
});

// Prevent duplicate grade entries for same student, course, and specific assignment type in a term/year
// This index will prevent adding two "Assignment" grades for the same student in the same course, term, and academic year
// without considering 'assignmentName'. You might need to adjust this index for more flexibility.
// For example, if you allow multiple assignments per term, you'd include assignmentName in the unique index.
gradeSchema.index({ student: 1, course: 1, gradeType: 1, assignmentName: 1, term: 1, academicYear: 1 }, { unique: true });


const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;