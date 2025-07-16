// server/routes/announcementRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from '../controllers/announcementController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getAnnouncements)
  .post(protect, authorizeRoles('admin'), createAnnouncement);

router.route('/:id')
  .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getAnnouncementById)
  .put(protect, authorizeRoles('admin'), updateAnnouncement)
  .delete(protect, authorizeRoles('admin'), deleteAnnouncement);

export default router;