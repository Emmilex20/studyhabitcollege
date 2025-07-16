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
      required: false,
    },
    yearLevel: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: false, // make required if needed
    },
    term: {
      type: String,
      required: false, // make required if needed
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
