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
  assignmentName: { // ✅ Add this
    type: String,
    required: true,
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
  maxScore: { // ✅ Add this
    type: Number,
    required: true,
    default: 100,
    min: 1,
  },
  weight: {
    type: Number,
    default: 1,
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
  dateGraded: { // ✅ Rename this from dateRecorded
    type: Date,
    default: Date.now,
  },
  dateRecorded: { // ✅ Rename this from dateRecorded
    type: Date,
    default: Date.now,
  },
  remarks: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Prevent duplicate grade entries for same student, course, and grade type
gradeSchema.index({ student: 1, course: 1, gradeType: 1, term: 1, academicYear: 1 }, { unique: true });

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;
