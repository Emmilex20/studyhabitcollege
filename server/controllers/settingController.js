import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// Define a common query for the global settings document
const GLOBAL_SETTINGS_QUERY = { type: 'global_settings' };

// @desc    Get academic years from the global settings document
// @route   GET /api/settings/academic-years
// @access  Private
const getAcademicYears = asyncHandler(async (req, res) => {
  const settingsDocument = await Setting.findOne(GLOBAL_SETTINGS_QUERY);

  if (settingsDocument) {
    res.status(200).json(settingsDocument.academicYears || []);
  } else {
    console.warn('Global settings document not found for academic years. Returning empty array.');
    res.status(200).json([]);
  }
});

// @desc    Get terms from the global settings document
// @route   GET /api/settings/terms
// @access  Private
const getTerms = asyncHandler(async (req, res) => {
  const settingsDocument = await Setting.findOne(GLOBAL_SETTINGS_QUERY);

  if (settingsDocument) {
    res.status(200).json(settingsDocument.terms || []);
  } else {
    console.warn('Global settings document not found for terms. Returning empty array.');
    res.status(200).json([]);
  }
});

// @desc    Get year levels from the global settings document
// @route   GET /api/settings/year-levels
// @access  Private
const getYearLevels = asyncHandler(async (req, res) => {
  const settingsDocument = await Setting.findOne(GLOBAL_SETTINGS_QUERY);

  if (settingsDocument) {
    res.status(200).json(settingsDocument.yearLevels || []);
  } else {
    console.warn('Global settings document not found for year levels. Returning empty array.');
    res.status(200).json([]);
  }
});

// @desc    Update a specific array within the global settings document
// @route   PUT /api/settings/:key
// @access  Private (Admin only)
const updateSetting = asyncHandler(async (req, res) => {
  // Ensure req.user is available via protect middleware
  if (!req.user || req.user.role !== 'admin') {
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
  let settingsDocument = await Setting.findOne(GLOBAL_SETTINGS_QUERY);

  if (!settingsDocument) {
    console.warn('Global settings document not found in DB. Attempting to create it.');
    try {
      settingsDocument = await Setting.create({
        type: 'global_settings', // CRITICAL: This must match the query and schema's default
        academicYears: [],
        terms: [],
        yearLevels: [],
      });
      console.log('Global settings document created successfully.');
    } catch (createError) {
      if (createError.code === 11000) { // Duplicate key error
        console.warn('Attempted to create duplicate global settings document. Another process might have created it concurrently. Retrying find.');
        settingsDocument = await Setting.findOne(GLOBAL_SETTINGS_QUERY); // Try finding it again
        if (!settingsDocument) {
             console.error('Failed to find global settings document after create attempt. Error:', createError);
             return res.status(500).json({ message: 'Failed to initialize global settings.' });
        }
      } else {
        console.error('Error creating global settings document:', createError);
        return res.status(500).json({ message: 'Error creating global settings.' });
      }
    }
  }

  // At this point, settingsDocument should be available, either found or newly created
  res.status(200).json({
    academicYears: settingsDocument.academicYears || [],
    terms: settingsDocument.terms || [],
    yearLevels: settingsDocument.yearLevels || [],
  });
});

// ⭐ Ensure all functions are defined ABOVE this export statement
export {
  getAcademicYears,
  getTerms,
  getYearLevels,
  updateSetting,
  getAllSettings,
};