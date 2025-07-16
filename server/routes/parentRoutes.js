// server/routes/parentRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getMyChildren,
  getChildGrades,
  getChildAttendance,
} from '../controllers/parentController.js';

const router = express.Router();

router.get('/me/children', protect, authorizeRoles('parent'), getMyChildren);
router.get('/child/:studentId/grades', protect, authorizeRoles('parent'), getChildGrades);
router.get('/child/:studentId/attendance', protect, authorizeRoles('parent'), getChildAttendance);

export default router;
