// server/models/Course.js

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
      required: false, // Keep as false if a course can exist without an assigned teacher
    },
    yearLevel: {
      type: [String], // <--- CHANGE HERE: Now an array of Strings
      required: true,
      // You can keep enum for validation if you want to restrict possible values within the array.
      // All values in the array must be one of these.
      enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3', 'SSS1', 'SSS2', 'SSS3', 'Year 7'],
    },
    academicYear: {
      type: String, // Keep as String if it's still a single academic year per course
      required: false,
    },
    term: {
      type: [String], // <--- CHANGE HERE: Now an array of Strings
      required: false, // Set to true if a term is always required
      // Add enum if you want to restrict possible values within the array.
      enum: ['First Term', 'Second Term', 'Third Term'],
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