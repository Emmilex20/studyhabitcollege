// server/routes/gradeRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    getGrades,
    getGradeById,
    createGrade,
    updateGrade,
    deleteGrade,
} from '../controllers/gradeController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getGrades)
  .post(protect, authorizeRoles('admin', 'teacher'), createGrade); // Added 'teacher' role

router.route('/:id')
  .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getGradeById)
  .put(protect, authorizeRoles('admin', 'teacher'), updateGrade) // Added 'teacher' role
  .delete(protect, authorizeRoles('admin', 'teacher'), deleteGrade); // Added 'teacher' role

export default router;