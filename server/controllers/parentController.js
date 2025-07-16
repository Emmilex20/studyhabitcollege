// server/controllers/parentController.js
import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js'; 

// ✅ Get children of the logged-in parent
const getMyChildren = async (req, res) => {
  try {
    const children = await Student.find({ parent: req.user._id })
      .populate('user', 'firstName lastName email gender dateOfBirth phoneNumber address')
      .populate('enrolledCourses', 'name code'); // Fix: corrected field name

    res.status(200).json(children);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching children' });
  }
};

// ✅ Get grades for a specific child
// ✅ controllers/parentController.js
const getChildGrades = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId);
    if (!student || student.parent?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view grades for this student' });
    }

    const grades = await Grade.find({ student: studentId })
      .populate('course', 'name code') // ✅ make sure it's 'course', not 'enrolledCourses'
      .populate('teacher', 'firstName lastName');

    const formattedGrades = grades.map((grade) => ({
      _id: grade._id,
      course: grade.course ?? null, // ✅ send full course object
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching grades' });
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
