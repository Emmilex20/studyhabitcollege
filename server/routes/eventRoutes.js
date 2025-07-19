// server/routes/eventRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../config/multerConfig.js';
import {
    getEvents,
    getEventById, // This one is currently protected
    createEvent,
    updateEvent,
    deleteEvent,
    getPublicEventById // ✨ NEW: Add this if you create a public version ✨
} from '../controllers/eventController.js';

const router = express.Router();

// Public route for fetching all events (for the EventsCalendarPage)
router.get('/public', getEvents); // Assuming this is your public endpoint for ALL events

// ✨ NEW: Public route for fetching a single event by ID ✨
// You might need a separate controller function if getEventById relies on req.user
// For simplicity, let's just make the existing getEventById accessible publicly here
router.get('/public/:id', getEventById); // This exposes getEventById publicly

router.route('/')
    .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getEvents) // Authenticated view
    .post(protect, authorizeRoles('admin'), upload.single('image'), createEvent);

router.route('/:id')
    .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getEventById) // This route remains protected for dashboard access
    .put(protect, authorizeRoles('admin'), upload.single('image'), updateEvent)
    .delete(protect, authorizeRoles('admin'), deleteEvent);

export default router;