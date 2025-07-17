// server/routes/enrollmentRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    enrollStudentInCourse,
    unenrollStudentFromCourse,
} from '../controllers/enrollmentController.js';

const router = express.Router();

router.post('/enroll', protect, authorizeRoles('admin', 'teacher'), enrollStudentInCourse);
router.post('/unenroll', protect, authorizeRoles('admin', 'teacher'), unenrollStudentFromCourse);

export default router;