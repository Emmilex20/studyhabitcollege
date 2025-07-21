// server/controllers/parentController.js
import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js'; // Ensure Course model is imported if used directly
import User from '../models/User.js'; // Import User model to access firstName, lastName, and avatarUrl

// Using express-async-handler for simplified error handling
import asyncHandler from 'express-async-handler'; // Make sure you have this installed: npm install express-async-handler

// Function to determine letter grade from a 4.0 scale GPA
// This can be moved to a shared utility file if used across multiple controllers.
const getLetterGradeFromGPA = (gpa) => {
    if (gpa >= 3.85) return 'A+';
    if (gpa >= 3.5) return 'A';
    if (gpa >= 3.15) return 'A-';
    if (gpa >= 2.85) return 'B+';
    if (gpa >= 2.5) return 'B';
    if (gpa >= 2.15) return 'B-';
    if (gpa >= 1.85) return 'C+';
    if (gpa >= 1.5) return 'C';
    if (gpa >= 1.15) return 'C-';
    if (gpa >= 0.85) return 'D+';
    if (gpa >= 0.5) return 'D';
    if (gpa >= 0.15) return 'D-';
    return 'F';
};

// ✅ Get children of the logged-in parent with calculated grades and attendance
const getMyChildren = asyncHandler(async (req, res) => {
    // Log the user ID for debugging purposes
    console.log("Logged-in parent's user ID (req.user._id):", req.user._id);

    const childrenRaw = await Student.find({ parent: req.user._id })
        .populate('user', 'firstName lastName email avatarUrl') // Populate user data including avatarUrl
        .populate('enrolledCourses', 'name code credits'); // Populate course credits for GPA calculation

    // Log the raw children found
    console.log("Raw children found by query:", childrenRaw);

    if (!childrenRaw || childrenRaw.length === 0) {
        console.log("No children found for this parent ID.");
        return res.status(200).json({ children: [] }); // Return empty array wrapped in 'children' object
    }

    const childrenWithStats = await Promise.all(
        childrenRaw.map(async (child) => {
            // Fetch grades for this child, populating course credits
            const grades = await Grade.find({ student: child._id }).populate('course', 'credits');

            let totalGradePoints = 0;
            let totalCreditsForGPA = 0; // Separate from totalMaxScore for percentage average
            let totalScoreForPercentage = 0;
            let totalMaxScoreForPercentage = 0;

            grades.forEach((grade) => {
                if (grade.score !== undefined && grade.course && grade.course.credits !== undefined) {
                    let gradePoints = 0;
                    // GPA scale based on score
                    if (grade.score >= 90) { gradePoints = 4.0; }
                    else if (grade.score >= 80) { gradePoints = 3.0; }
                    else if (grade.score >= 70) { gradePoints = 2.0; }
                    else if (grade.score >= 60) { gradePoints = 1.0; }
                    else { gradePoints = 0.0; }

                    const credits = grade.course.credits;
                    totalGradePoints += (gradePoints * credits);
                    totalCreditsForGPA += credits;
                }

                // For overall percentage grade average
                if (typeof grade.score === 'number' && typeof grade.maxScore === 'number' && grade.maxScore > 0) {
                    totalScoreForPercentage += grade.score;
                    totalMaxScoreForPercentage += grade.maxScore;
                }
            });

            // Calculate GPA
            const gpa = totalCreditsForGPA > 0 ? parseFloat((totalGradePoints / totalCreditsForGPA).toFixed(2)) : 0.0;
            const letterGrade = getLetterGradeFromGPA(gpa);

            // Calculate overall percentage grade average (e.g., 85%)
            const gradeAverage = totalMaxScoreForPercentage > 0 ? (totalScoreForPercentage / totalMaxScoreForPercentage) * 100 : 0;

            // Fetch attendance records for this child
            const attendanceRecords = await Attendance.find({ student: child._id });

            let totalClasses = attendanceRecords.length;
            let presentCount = 0;
            attendanceRecords.forEach((record) => {
                if (record.status === 'Present') {
                    presentCount++;
                }
            });

            // Calculate attendance percentage
            const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

            // Construct the child object to send to the frontend
            const firstName = child.user?.firstName || 'Unknown';
            const lastName = child.user?.lastName || '';
            const avatarUrl = child.user?.avatarUrl || ''; // Provide a default empty string if avatarUrl is null/undefined

            return {
                _id: child._id,
                firstName: firstName,
                lastName: lastName,
                studentId: child.studentId,
                gpa: gpa, // The actual 4.0 scale GPA
                letterGrade: letterGrade, // The calculated letter grade
                gradeAverage: parseFloat(gradeAverage.toFixed(1)), // Percentage average (e.g., 85.5)
                attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
                avatarUrl: avatarUrl,
                currentClass: child.currentClass,
                enrolledCourses: child.enrolledCourses.map(course => ({
                    _id: course._id,
                    name: course.name,
                    code: course.code,
                    // Optionally add credits if your frontend needs it in enrolledCourses
                    credits: course.credits // Ensure 'credits' is populated in initial find if you need it here
                })),
                // Add any other fields you want to send from the Student or populated User model
            };
        })
    );
    // Respond with the children data wrapped in a 'children' object
    res.status(200).json({ children: childrenWithStats });
});

// ✅ Get grades for a specific child
const getChildGrades = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student || student.parent?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view grades for this student' });
    }

    const grades = await Grade.find({ student: studentId })
        .populate('course', 'name code')
        .populate('teacher', 'firstName lastName');

    const formattedGrades = grades.map((grade) => ({
        _id: grade._id,
        course: grade.course ?? null,
        assignmentName: grade.gradeType || 'Unnamed',
        score: grade.score ?? 0,
        maxScore: grade.maxScore ?? 100,
        percentage:
            grade.maxScore && grade.maxScore > 0
                ? `${((grade.score / grade.maxScore) * 100).toFixed(1)}%`
                : 'N/A',
        dateGraded: grade.dateGraded
            ? new Date(grade.dateGraded).toISOString()
            : null,
        feedback: grade.remarks || 'N/A',
        teacher: grade.teacher
            ? `${grade.teacher.firstName} ${grade.teacher.lastName}`
            : 'N/A',
    }));

    res.status(200).json(formattedGrades);
});

// ✅ Get attendance for a specific child
const getChildAttendance = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student || student.parent?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view attendance for this student' });
    }

    const attendance = await Attendance.find({ student: studentId })
        .populate('course', 'name code');

    const formattedAttendance = attendance.map((record) => ({
        _id: record._id,
        course: record.course ?? null,
        status: record.status,
        reason: record.reason || 'N/A',
        date: record.date
            ? new Date(record.date).toISOString()
            : null,
    }));

    res.status(200).json(formattedAttendance);
});

export {
    getMyChildren,
    getChildGrades,
    getChildAttendance,
};