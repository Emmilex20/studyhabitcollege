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
  .get(protect, getCourses) // ✅ protect added here
  .post(protect, authorizeRoles('admin'), createCourse);

router.route('/:id')
  .get(protect, getCourseById) // optional: make public if needed
  .put(protect, authorizeRoles('admin'), updateCourse)
  .delete(protect, authorizeRoles('admin'), deleteCourse);

export default router;
