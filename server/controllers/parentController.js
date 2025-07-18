// server/controllers/parentController.js
import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import User from '../models/User.js'; // Import User model to access firstName, lastName directly

// ✅ Get children of the logged-in parent with calculated grades and attendance
const getMyChildren = async (req, res) => {
  try {
    const childrenRaw = await Student.find({ parent: req.user._id })
      .populate('user', 'firstName lastName email') // Populate user data for names
      .populate('enrolledCourses', 'name code');

    const childrenWithStats = await Promise.all(
      childrenRaw.map(async (child) => {
        // Fetch grades for this child
        const grades = await Grade.find({ student: child._id });

        let totalScore = 0;
        let totalMaxScore = 0;
        grades.forEach((grade) => {
          if (typeof grade.score === 'number' && typeof grade.maxScore === 'number' && grade.maxScore > 0) {
            totalScore += grade.score;
            totalMaxScore += grade.maxScore;
          }
        });

        // Calculate grade average
        const gradeAverage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

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
        // Safely access user's firstName and lastName from the populated 'user' field
        const firstName = child.user?.firstName || 'Unknown';
        const lastName = child.user?.lastName || '';
        const avatarUrl = child.user?.avatarUrl; // Assuming you might add an avatarUrl to the User model later

        return {
          _id: child._id,
          firstName: firstName,
          lastName: lastName,
          studentId: child.studentId,
          gradeAverage: parseFloat(gradeAverage.toFixed(1)), // Format to one decimal place
          attendancePercentage: parseFloat(attendancePercentage.toFixed(1)), // Format to one decimal place
          avatarUrl: avatarUrl, // Will be undefined if not in User model
          currentClass: child.currentClass,
          enrolledCourses: child.enrolledCourses,
          // Add any other fields you want to send from the Student or populated User model
        };
      })
    );

    res.status(200).json(childrenWithStats);
  } catch (error) {
    console.error('Error fetching children for parent dashboard:', error);
    res.status(500).json({ message: 'Server error while fetching children' });
  }
};


// ✅ Get attendance for a specific child
const getChildAttendance = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId);
    if (!student || student.parent?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view attendance for this student' });
    }

    const attendance = await Attendance.find({ student: studentId })
      .populate('course', 'name code');

    const formattedAttendance = attendance.map((record) => ({
  _id: record._id,
  course: record.course ?? null, // ✅ send full object to frontend
  status: record.status,
  reason: record.reason || 'N/A',
  date: record.date
    ? new Date(record.date).toISOString()
    : null,
}));

    res.status(200).json(formattedAttendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
};

export {
  getMyChildren,
  getChildGrades,
  getChildAttendance,
};
