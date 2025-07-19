// server/routes/eventRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    getEvents,       // This controller will now be used for public and protected views
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} from '../controllers/eventController.js';

const router = express.Router();

// 1. PUBLIC ROUTE for fetching ALL events (for the EventsCalendarPage)
//    This route does NOT have 'protect' or 'authorizeRoles' middleware.
router.get('/public', getEvents); // You can choose any suitable path, e.g., '/all', '/calendar'

// 2. PROTECTED ROUTES for managing or role-specific viewing of events
//    Keep your existing protected routes as they are for dashboard functionalities.
router.route('/')
    // This GET endpoint can be kept if your dashboard needs a different 'getEvents' behavior,
    // or if you want to explicitly protect the root path for some reason.
    // If AdminEventsPage also uses the public /public route, you can remove this specific GET method here.
    .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getEvents) // For authenticated users viewing all events
    .post(protect, authorizeRoles('admin'), createEvent); // Only admin can create

router.route('/:id')
    .get(protect, authorizeRoles('admin', 'teacher', 'student', 'parent'), getEventById)
    .put(protect, authorizeRoles('admin'), updateEvent) // Only admin can update
    .delete(protect, authorizeRoles('admin'), deleteEvent); // Only admin can delete

export default router;