import express from 'express';
import {
    getAcademicYears,
    getTerms,
    getYearLevels,
    updateSetting,
    getAllSettings // Assuming you will implement this in your controller
} from '../controllers/settingController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🎯 NEW ROUTE: Handles GET requests to /api/settings
// This will return the combined settings object
router.route('/').get(protect, getAllSettings); // Protect this route as well

// Your existing specific routes (keeping them for now, but consider if they're still needed)
router.route('/academic-years').get(protect, getAcademicYears);
router.route('/terms').get(protect, getTerms);
router.route('/year-levels').get(protect, getYearLevels);

// Admin-only route for updating settings by key
router.route('/:key').put(protect, authorizeRoles(['admin']), updateSetting);

export default router;