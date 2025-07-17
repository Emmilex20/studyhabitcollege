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
      // ✨ TEMPORARY FIX: Add your existing school year levels here
      enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3', 'SSS1', 'SSS2', 'SSS3', 'Year 7'],
    },
    academicYear: {
      type: String,
      required: false,
    },
    term: {
      type: String,
      required: false,
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
      default: 3,
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