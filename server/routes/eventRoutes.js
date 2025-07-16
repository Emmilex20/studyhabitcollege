// server/routes/eventRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} from '../controllers/eventController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getEvents) // All authenticated users can view
  .post(protect, authorizeRoles('admin'), createEvent); // Only admin can create

router.route('/:id')
  .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getEventById)
  .put(protect, authorizeRoles('admin'), updateEvent) // Only admin can update
  .delete(protect, authorizeRoles('admin'), deleteEvent); // Only admin can delete

export default router;