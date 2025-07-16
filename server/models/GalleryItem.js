// server/models/GalleryItem.js
import mongoose from 'mongoose';

const galleryItemSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: { // This will store the URL from Cloudinary
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['academics', 'sports', 'events', 'facilities', 'arts', 'general'], // Define your categories
      default: 'general',
    },
    uploadedBy: { // To track which admin uploaded it (optional but good for auditing)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);

export default GalleryItem;