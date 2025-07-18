// server/routes/courseRoutes.js
import express from 'express';
import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseCount,
} from '../controllers/courseController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getCourses) // <-- ADDED 'teacher' here
  .post(protect, authorizeRoles('admin', 'teacher'), createCourse);

// CRITICAL CHANGE: Place this route BEFORE the dynamic '/:id' route
router.get('/count', protect, authorizeRoles('admin'), getCourseCount);

router.route('/:id')
  .get(protect, authorizeRoles('admin', 'teacher'), getCourseById) // <-- Consider if teachers should get any course by ID
  .put(protect, authorizeRoles('admin', 'teacher'), updateCourse)
  .delete(protect, authorizeRoles('admin'), deleteCourse);

export default router;