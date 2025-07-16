// server/routes/galleryRoutes.js
import express from 'express';
import {
  getGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../config/multerConfig.js'; // We will create this next

const router = express.Router();

// Public routes for viewing gallery
router.get('/', getGalleryItems);
router.get('/:id', getGalleryItemById);

// Admin-only routes for CRUD operations
// 'upload.single('image')' will handle the image file upload
router.post('/', protect, authorizeRoles('admin'), upload.single('image'), createGalleryItem);
router.put('/:id', protect, authorizeRoles('admin'), upload.single('image'), updateGalleryItem); // Image update is optional
router.delete('/:id', protect, authorizeRoles('admin'), deleteGalleryItem);

export default router;