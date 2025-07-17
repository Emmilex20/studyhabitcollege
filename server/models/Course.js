import mongoose from 'mongoose';

const courseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Make required:true if a course must always have an assigned teacher
    },
    yearLevel: {
      type: String,
      required: true,
      enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'], // Added enum for better data validation
    },
    academicYear: {
      type: String,
      required: false, // Set to true if an academic year is always mandatory
    },
    term: {
      type: String,
      required: false, // Set to true if a term is always mandatory
    },
    credits: { // ✨ ADDED THIS FIELD FOR GPA CALCULATION
      type: Number,
      required: true, // Credits are typically required for GPA calculation
      min: 0, // Credits should not be negative
      default: 3, // Common default, adjust as needed for your institution
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;