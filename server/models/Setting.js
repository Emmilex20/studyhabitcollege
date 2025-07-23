import mongoose from 'mongoose';

const settingSchema = mongoose.Schema(
  {
    // These fields directly map to your existing MongoDB document structure
    academicYears: {
      type: [String], // Array of strings
      default: [],    // Default to an empty array
    },
    terms: {
      type: [String], // Array of strings
      default: [],
    },
    yearLevels: {
      type: [String], // Array of strings
      default: [],
    },
    // This 'type' field will uniquely identify your global settings document.
    // Ensure the document in your DB has "type": "global_settings"
    type: {
      type: String,
      default: 'global_settings',
      unique: true, // Only one document with type 'global_settings'
      required: true,
    },
    // IMPORTANT: If you no longer use 'key' or 'values' fields for THIS global document,
    // REMOVE THEM FROM THE SCHEMA. If you *do* have other setting documents that
    // use 'key' and 'values' and reside in the *same collection*, you'd need
    // to define a more complex schema or use separate collections.
    // For now, let's assume this schema is for the single global settings document.
  },
  {
    timestamps: true, // Optional: for createdAt and updatedAt
  }
);

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;