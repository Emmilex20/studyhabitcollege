import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// @desc    Get academic years
// @route   GET /api/settings/academic-years
// @access  Private (e.g., Admin, or any logged-in user who needs this data)
const getAcademicYears = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: 'academicYears' });

  if (setting) {
    res.status(200).json(setting.values);
  } else {
    // If not found in DB, return an empty array or a default set
    console.warn('Academic years setting not found in DB. Returning empty array.');
    res.status(200).json([]); // Or ['2023/2024', '2024/2025'] as a fallback
  }
});

// @desc    Get terms
// @route   GET /api/settings/terms
// @access  Private
const getTerms = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: 'terms' });

  if (setting) {
    res.status(200).json(setting.values);
  } else {
    console.warn('Terms setting not found in DB. Returning empty array.');
    res.status(200).json([]); // Or ['First Term', 'Second Term', 'Third Term'] as a fallback
  }
});

// @desc    Get year levels
// @route   GET /api/settings/year-levels
// @access  Private
const getYearLevels = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: 'yearLevels' });

  if (setting) {
    res.status(200).json(setting.values);
  } else {
    console.warn('Year levels setting not found in DB. Returning empty array.');
    res.status(200).json([]); // Or the initial hardcoded list as a fallback
  }
});

// @desc    Update (or create) a setting
// @route   PUT /api/settings/:key
// @access  Private (Admin only) - This is crucial for security
const updateSetting = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') { // Ensure only admins can update settings
    res.status(403);
    throw new Error('Not authorized to update settings. Admin access required.');
  }

  const { key } = req.params;
  const { values } = req.body;

  if (!Array.isArray(values)) {
    res.status(400);
    throw new Error('Values must be an array.');
  }

  // findOneAndUpdate with upsert:true will create the document if it doesn't exist
  const setting = await Setting.findOneAndUpdate(
    { key },
    { values },
    { new: true, upsert: true, runValidators: true }
  );

  if (setting) {
    res.status(200).json(setting);
  } else {
    res.status(500);
    throw new Error('Failed to update or create setting.');
  }
});


export {
  getAcademicYears,
  getTerms,
  getYearLevels,
  updateSetting, // Export the update function for admin use
};