// server/routes/attendanceRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    getAttendance,
    getAttendanceById,
    createAttendance,
    updateAttendance,
    deleteAttendance,
} from '../controllers/attendanceController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getAttendance)
  .post(protect, authorizeRoles('admin', 'teacher'), createAttendance); // Added 'teacher' role

router.route('/:id')
  .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getAttendanceById)
  .put(protect, authorizeRoles('admin', 'teacher'), updateAttendance) // Added 'teacher' role
  .delete(protect, authorizeRoles('admin', 'teacher'), deleteAttendance); // Added 'teacher' role

export default router;