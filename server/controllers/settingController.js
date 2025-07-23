import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// Define a common query for the global settings document
const GLOBAL_SETTINGS_QUERY = { type: 'global_settings' }; // Matches the 'type' field in the schema and DB document

// ... (getAcademicYears, getTerms, getYearLevels, updateSetting - these will now correctly find/update by 'type') ...

// @desc    Get all settings (academic years, terms, year levels) from the single global document
// @route   GET /api/settings
// @access  Private
const getAllSettings = asyncHandler(async (req, res) => {
  let settingsDocument = await Setting.findOne(GLOBAL_SETTINGS_QUERY);

  if (!settingsDocument) { // If the document is not found
    console.warn('Global settings document not found in DB. Attempting to create it.');
    try {
      // Create the document with the defined 'type' field
      settingsDocument = await Setting.create({
        type: 'global_settings', // CRITICAL: This must match the query and schema default
        academicYears: [],
        terms: [],
        yearLevels: [],
      });
      console.log('Global settings document created successfully.');
    } catch (createError) {
      // Catch duplicate key errors or other creation errors
      if (createError.code === 11000) { // E11000 is duplicate key error
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

export {
  getAcademicYears,
  getTerms,
  getYearLevels,
  updateSetting,
  getAllSettings,
};