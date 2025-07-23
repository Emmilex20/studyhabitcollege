import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// Define a common query for the global settings document
// This should match the 'type' field in your Setting model and MongoDB document
const GLOBAL_SETTINGS_QUERY = { type: 'global_settings' };

// @desc    Get academic years from the global settings document
// @route   GET /api/settings/academic-years (can still be used, but getAllSettings is preferred)
// @access  Private
const getAcademicYears = asyncHandler(async (req, res) => {
  // Find the single global settings document
  const settingsDocument = await Setting.findOne(GLOBAL_SETTINGS_QUERY);

  if (settingsDocument) {
    res.status(200).json(settingsDocument.academicYears || []); // Access the direct property
  } else {
    console.warn('Global settings document not found for academic years. Returning empty array.');
    res.status(200).json([]);
  }
});

// @desc    Get terms from the global settings document
// @route   GET /api/settings/terms (can still be used)
// @access  Private
const getTerms = asyncHandler(async (req, res) => {
  const settingsDocument = await Setting.findOne(GLOBAL_SETTINGS_QUERY);

  if (settingsDocument) {
    res.status(200).json(settingsDocument.terms || []); // Access the direct property
  } else {
    console.warn('Global settings document not found for terms. Returning empty array.');
    res.status(200).json([]);
  }
});

// @desc    Get year levels from the global settings document
// @route   GET /api/settings/year-levels (can still be used)
// @access  Private
const getYearLevels = asyncHandler(async (req, res) => {
  const settingsDocument = await Setting.findOne(GLOBAL_SETTINGS_QUERY);

  if (settingsDocument) {
    res.status(200).json(settingsDocument.yearLevels || []); // Access the direct property
  } else {
    console.warn('Global settings document not found for year levels. Returning empty array.');
    res.status(200).json([]);
  }
});

// @desc    Update a specific array within the global settings document
// @route   PUT /api/settings/:key (where :key is 'academicYears', 'terms', or 'yearLevels')
// @access  Private (Admin only)
const updateSetting = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update settings. Admin access required.');
  }

  const { key } = req.params; // 'academicYears', 'terms', 'yearLevels'
  const { values } = req.body; // The new array of strings

  if (!Array.isArray(values)) {
    res.status(400);
    throw new Error('Values must be an array.');
  }

  // Find the global settings document and update the specific array field
  const settingsDocument = await Setting.findOneAndUpdate(
    GLOBAL_SETTINGS_QUERY, // Find the global settings document
    { $set: { [key]: values } }, // Use $set to update a specific field by its name
    { new: true, upsert: true, runValidators: true } // upsert:true will create if not found
  );

  if (settingsDocument) {
    // Return the updated document or just success message
    res.status(200).json(settingsDocument);
  } else {
    res.status(500);
    throw new Error('Failed to update or create global setting document.');
  }
});

// @desc    Get all settings (academic years, terms, year levels) from the single global document
// @route   GET /api/settings
// @access  Private
const getAllSettings = asyncHandler(async (req, res) => {
  const settingsDocument = await Setting.findOne(GLOBAL_SETTINGS_QUERY);

  if (settingsDocument) {
    res.status(200).json({
      academicYears: settingsDocument.academicYears || [],
      terms: settingsDocument.terms || [],
      yearLevels: settingsDocument.yearLevels || [],
    });
  } else {
    console.warn('Global settings document not found in DB. Returning empty arrays for settings.');
    // If the document doesn't exist, create it with empty arrays
    const newSettings = await Setting.create({
      type: 'global_settings', // Ensure this matches your schema's default/expected type
      academicYears: [],
      terms: [],
      yearLevels: [],
    });
    res.status(200).json({
      academicYears: newSettings.academicYears,
      terms: newSettings.terms,
      yearLevels: newSettings.yearLevels,
    });
  }
});

export {
  getAcademicYears,
  getTerms,
  getYearLevels,
  updateSetting,
  getAllSettings,
};