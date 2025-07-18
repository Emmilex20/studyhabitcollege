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
    enrollStudentInCourse,
    unenrollStudentFromCourse
} from '../controllers/studentController.js';
import { getMyGrades } from '../controllers/gradeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getMyAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

// -------------------------------------------------------------------------
// IMPORTANT: Place specific routes above generic dynamic routes (e.g., /:id)
// -------------------------------------------------------------------------

// Student Count Route (more specific than /:id)
router.get('/count', protect, authorizeRoles('admin'), getStudentCount);

// Student "Me" Routes (more specific than /:id)
router.get('/me/courses', protect, authorizeRoles('student'), getMyCourses);
router.get('/me/grades', protect, authorizeRoles('student'), getMyGrades);
router.get('/me/attendance', protect, authorizeRoles('student'), getMyAttendance);
router.get('/me/gpa', protect, authorizeRoles('student'), getStudentGPA);
router.get('/me/courses/count', protect, authorizeRoles('student'), getMyCoursesCount);
router.get('/me/deadlines', protect, authorizeRoles('student'), getUpcomingDeadlines);

// Enrollment/Unenrollment Routes (dynamic but specific actions on a studentId)
router.post('/:studentId/enroll', protect, authorizeRoles('admin'), enrollStudentInCourse); // Admin can enroll any student
router.delete('/:studentId/unenroll', protect, authorizeRoles('admin'), unenrollStudentFromCourse); // Admin can unenroll any student

// Parent-specific routes (more specific paths)
router.get('/parent/me/children', protect, authorizeRoles('parent'), getMyChildren);
router.get('/parent/child/:studentId/grades', protect, authorizeRoles('parent'), getChildGrades);
router.get('/parent/child/:studentId/attendance', protect, authorizeRoles('parent'), getChildAttendance);
router.get('/parent/me/announcements', protect, authorizeRoles('parent'), getParentAnnouncements);
router.get('/parent/me/events', protect, authorizeRoles('parent'), getParentEvents);


// Generic student routes (catch-all for base path, and dynamic :id routes)
// This should come after all more specific paths starting with /api/students/...
router.route('/')
    .get(protect, authorizeRoles('admin', 'teacher', 'parent', 'student'), getStudents)
    .post(protect, authorizeRoles('admin', 'teacher'), createStudent);

router.route('/:id') // This must come LAST among student-related routes that start with /:something
    .get(protect, authorizeRoles('admin', 'teacher', 'parent'), getStudentById)
    .put(protect, authorizeRoles('admin', 'teacher'), updateStudent)
    .delete(protect, authorizeRoles('admin'), deleteStudent);


export default router;