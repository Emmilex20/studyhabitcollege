import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseCount, // Make sure this is imported
} from '../controllers/courseController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCourses)
  .post(protect, authorizeRoles('admin', 'teacher'), createCourse);

// ✨ CRITICAL CHANGE: Place this route BEFORE the dynamic '/:id' route
router.get('/count', protect, authorizeRoles('admin'), getCourseCount); 

router.route('/:id')
  .get(protect, getCourseById)
  .put(protect, authorizeRoles('admin', 'teacher'), updateCourse)
  .delete(protect, authorizeRoles('admin'), deleteCourse);

export default router;