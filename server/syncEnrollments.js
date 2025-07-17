// server/syncEnrollments.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Student from './models/Student.js';
import Course from './models/Course.js';

dotenv.config(); // Load environment variables

const syncEnrollments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for synchronization!');

        // 1. Clear all existing student references in courses (to start fresh and avoid duplicates)
        // This is a drastic step for cleaning up, use with caution if you have complex scenarios.
        // For simple consistency fix, it's often the easiest.
        // Alternatively, you can iterate through courses and filter out invalid/old references.
        // For this specific issue ("Students Enrolled: 0"), clearing is likely okay.
        await Course.updateMany({}, { $set: { students: [] } });
        console.log('Cleared all student lists in Course documents.');

        // 2. Iterate through all students and update their enrolled courses' student lists
        const students = await Student.find({}).populate('enrolledCourses');

        for (const student of students) {
            console.log(`Processing student: ${student.studentId} (${student.user})`);
            if (student.enrolledCourses && student.enrolledCourses.length > 0) {
                for (const courseRef of student.enrolledCourses) {
                    // Make sure courseRef is a valid object and has an _id
                    const courseId = courseRef._id || courseRef; // Handle both populated and unpopulated refs

                    if (courseId) {
                        const course = await Course.findById(courseId);
                        if (course) {
                            // Ensure student is not already in the course's students array
                            if (!course.students.some(id => id.equals(student._id))) {
                                course.students.push(student._id);
                                await course.save();
                                console.log(`  -> Enrolled student ${student.studentId} in course ${course.name} (${course.code})`);
                            } else {
                                console.log(`  -> Student ${student.studentId} already in course ${course.name} (${course.code})'s student list.`);
                            }
                        } else {
                            console.warn(`  -> Warning: Course with ID ${courseId} not found for student ${student.studentId}. Removing from student's enrolledCourses.`);
                            // Optionally remove the invalid course reference from the student
                            student.enrolledCourses = student.enrolledCourses.filter(id => !id.equals(courseId));
                            await student.save();
                        }
                    }
                }
            } else {
                console.log(`  -> Student ${student.studentId} has no enrolled courses.`);
            }
        }

        console.log('Enrollment synchronization complete!');

    } catch (error) {
        console.error('Error during enrollment synchronization:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

syncEnrollments();