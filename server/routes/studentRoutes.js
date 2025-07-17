// server/routes/studentRoutes.js
import express from 'express';
import {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getMyCourses,
    getMyChildren,
    getChildGrades,
    getChildAttendance,
    getParentAnnouncements,
    getParentEvents,
    getStudentGPA,
    getMyCoursesCount,
    getUpcomingDeadlines, // <--- Add this import
} from '../controllers/studentController.js';
import { getMyGrades } from '../controllers/gradeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getMyAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.route('/')
    .get(protect, authorizeRoles('admin', 'teacher', 'parent', 'student'), getStudents)
    .post(protect, authorizeRoles('admin'), createStudent);

router.get('/me/courses', protect, authorizeRoles('student'), getMyCourses);
router.get('/me/grades', protect, authorizeRoles('student'), getMyGrades);
router.get('/me/attendance', protect, authorizeRoles('student'), getMyAttendance);
router.get('/me/gpa', protect, authorizeRoles('student'), getStudentGPA);
router.get('/me/courses/count', protect, authorizeRoles('student'), getMyCoursesCount);
router.get('/me/deadlines', protect, authorizeRoles('student'), getUpcomingDeadlines); // <--- Add this new route

router.route('/:id')
    .get(protect, authorizeRoles('admin', 'teacher', 'parent'))
    .put(protect, authorizeRoles('admin'), updateStudent)
    .delete(protect, authorizeRoles('admin'), deleteStudent);

// Get parent's linked children
router.get('/parent/me/children', protect, authorizeRoles('parent'), getMyChildren);

// Get grades for a specific child
router.get('/parent/child/:studentId/grades', protect, authorizeRoles('parent'), getChildGrades);

// Get attendance for a specific child
router.get('/parent/child/:studentId/attendance', protect, authorizeRoles('parent'), getChildAttendance);

// Get announcements for parent dashboard
router.get('/parent/me/announcements', protect, authorizeRoles('parent'), getParentAnnouncements);

// Get events for parent dashboard
router.get('/parent/me/events', protect, authorizeRoles('parent'), getParentEvents);

export default router;