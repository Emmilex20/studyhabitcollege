import mongoose from 'mongoose';

const settingSchema = mongoose.Schema(
  {
    key: { // This will store the name of the setting, e.g., 'academicYears', 'terms', 'yearLevels'
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    values: { // This will store the array of strings for each setting
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true, // Optional: useful for tracking when settings were last updated
  }
);

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;