// server/models/Student.js
import mongoose from 'mongoose';

const studentSchema = mongoose.Schema(
  {
    user: { // Link to the User model for authentication and general profile
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One user can only be one student
    },
    studentId: { // Unique ID for school use
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    currentClass: { // E.g., JSS1A, SS2C
      type: String,
      required: false, // Can be assigned later
    },
    // ⭐ New field for the current academic term ⭐
    currentTerm: {
      type: String, // You can use a string like 'Fall 2024', 'Term 1', '2024-2025 Semester A'
      required: false, // Make it optional, as it might be set dynamically or later
      trim: true,
    },
    enrolledCourses: [ // Array of references to Course model
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    parent: { // Reference to User model (parent)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // A student might not have a linked parent user initially
    },
    relation: { // e.g., "Mother", "Father", "Guardian" (this field might be better placed on the User model for parents if a parent can have multiple children)
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', studentSchema);

export default Student;