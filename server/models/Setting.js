import mongoose from 'mongoose';

const settingSchema = mongoose.Schema(
  {
    // These fields directly map to your existing MongoDB document structure
    academicYears: {
      type: [String], // Array of strings
      default: [],    // Default to an empty array if not present
    },
    terms: {
      type: [String], // Array of strings
      default: [],
    },
    yearLevels: {
      type: [String], // Array of strings
      default: [],
    },
    // Add a 'type' or 'name' field for the global settings document
    // This makes it easier to query specifically for THIS document
    // rather than relying on findOne({}) which just picks the first one.
    // If you add this, you'll need to update your DB document once
    // to include a "type": "global_settings" field.
    type: {
      type: String,
      default: 'global_settings',
      unique: true, // Ensures only one document of this type exists
      required: true, // Make it required for the global settings doc
    },
  },
  {
    timestamps: true, // Keep optional timestamps
  }
);

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;