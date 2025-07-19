// server/routes/eventRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../config/multerConfig.js'; // ✨ Import the upload middleware ✨
import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} from '../controllers/eventController.js';

const router = express.Router();

// Public route for fetching all events (for the EventsCalendarPage)
router.get('/public', getEvents); // Assuming this is your public endpoint

router.route('/')
    .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getEvents) // Authenticated view
    // ✨ Apply upload.single('image') middleware before createEvent ✨
    .post(protect, authorizeRoles('admin'), upload.single('image'), createEvent);

router.route('/:id')
    .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getEventById)
    // ✨ Apply upload.single('image') middleware before updateEvent ✨
    .put(protect, authorizeRoles('admin'), upload.single('image'), updateEvent)
    .delete(protect, authorizeRoles('admin'), deleteEvent);

export default router;