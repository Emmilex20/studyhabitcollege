import express from 'express';
import {
  getAcademicYears,
  getTerms,
  getYearLevels,
  updateSetting,
} from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js'; // Assuming you have these middleware functions

const router = express.Router();

// Public routes for fetching settings (or protect if you only want logged-in users to see them)
// We'll protect them for this example, as they are part of admin configurations
router.route('/academic-years').get(protect, getAcademicYears);
router.route('/terms').get(protect, getTerms);
router.route('/year-levels').get(protect, getYearLevels);

// Admin-only route for updating settings
router.route('/:key').put(protect, authorize(['admin']), updateSetting);

export default router;