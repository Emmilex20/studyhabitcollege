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
    getUpcomingDeadlines,
    getStudentCount,
    enrollStudentInCourse,   // <--- New import
    unenrollStudentFromCourse // <--- New import
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
router.get('/me/deadlines', protect, authorizeRoles('student'), getUpcomingDeadlines);

router.route('/:id')
    .get(protect, authorizeRoles('admin', 'teacher', 'parent'), getStudentById) // Added getStudentById explicitly here
    .put(protect, authorizeRoles('admin'), updateStudent)
    .delete(protect, authorizeRoles('admin'), deleteStudent);

router.get('/count', protect, authorizeRoles('admin'), getStudentCount);

// New Routes for Enrollment/Unenrollment
router.post('/:studentId/enroll', protect, authorizeRoles('admin'), enrollStudentInCourse); // Admin can enroll any student
router.delete('/:studentId/unenroll', protect, authorizeRoles('admin'), unenrollStudentFromCourse); // Admin can unenroll any student

// Optional: Allow students to self-enroll/unenroll, but you'd need careful business logic.
// router.post('/me/enroll', protect, authorizeRoles('student'), enrollStudentInCourse);
// router.delete('/me/unenroll', protect, authorizeRoles('student'), unenrollStudentFromCourse);


// Parent-specific routes
router.get('/parent/me/children', protect, authorizeRoles('parent'), getMyChildren);
router.get('/parent/child/:studentId/grades', protect, authorizeRoles('parent'), getChildGrades);
router.get('/parent/child/:studentId/attendance', protect, authorizeRoles('parent'), getChildAttendance);
router.get('/parent/me/announcements', protect, authorizeRoles('parent'), getParentAnnouncements);
router.get('/parent/me/events', protect, authorizeRoles('parent'), getParentEvents);


export default router;