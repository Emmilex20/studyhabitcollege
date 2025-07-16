// server/controllers/galleryController.js
import GalleryItem from '../models/GalleryItem.js';
import cloudinary from 'cloudinary'; // Import cloudinary

// Configure Cloudinary (Make sure these are in your .env and loaded by your app.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
const getGalleryItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const galleryItems = await GalleryItem.find(filter).populate('uploadedBy', 'firstName lastName'); // Populate uploader info
    res.status(200).json(galleryItems);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ message: 'Server error: Could not fetch gallery items.' });
  }
};

// @desc    Get single gallery item by ID
// @route   GET /api/gallery/:id
// @access  Public
const getGalleryItemById = async (req, res) => {
  try {
    const galleryItem = await GalleryItem.findById(req.params.id).populate('uploadedBy', 'firstName lastName');
    if (galleryItem) {
      res.status(200).json(galleryItem);
    } else {
      res.status(404).json({ message: 'Gallery item not found' });
    }
  } catch (error) {
    console.error('Error fetching gallery item by ID:', error);
    res.status(500).json({ message: 'Server error: Could not fetch gallery item.' });
  }
};

// @desc    Create a new gallery item
// @route   POST /api/gallery
// @access  Private/Admin
const createGalleryItem = async (req, res) => {
  const { title, description, category } = req.body;
  const imageUrl = req.file ? req.file.path : null; // Path from Multer/Cloudinary upload

  if (!imageUrl) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  try {
    // Upload image to Cloudinary (if not already handled by multer-storage-cloudinary)
    // If you're using simple multer without Cloudinary storage, you'd upload here.
    // For simplicity, let's assume `req.file.path` is already the Cloudinary URL
    // if using `multer-storage-cloudinary`, or a local path if using disk storage.
    // If local, you'd do:
    // const result = await cloudinary.uploader.upload(req.file.path, {
    //   folder: 'studyhabit_gallery', // Optional: organize images in a folder
    // });
    // const finalImageUrl = result.secure_url;
    // fs.unlinkSync(req.file.path); // Delete local file after upload

    const galleryItem = new GalleryItem({
      title,
      description,
      imageUrl: imageUrl, // Use the path provided by multer/cloudinary storage
      category,
      uploadedBy: req.user._id, // User ID from authMiddleware
    });

    const createdGalleryItem = await galleryItem.save();
    res.status(201).json(createdGalleryItem);
  } catch (error) {
    console.error('Error creating gallery item:', error);
    if (req.file && req.file.path && req.file.path.includes('res.cloudinary.com')) {
        // If upload failed but image made it to cloudinary, consider deleting it.
        // This is complex and might be better handled by transaction if possible.
        // For now, focus on core functionality.
    }
    res.status(500).json({ message: 'Server error: Could not create gallery item.' });
  }
};

// @desc    Update a gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
const updateGalleryItem = async (req, res) => {
  const { title, description, category } = req.body; // imageUrl update handled separately via new upload

  try {
    const galleryItem = await GalleryItem.findById(req.params.id);

    if (galleryItem) {
      galleryItem.title = title || galleryItem.title;
      galleryItem.description = description || galleryItem.description;
      galleryItem.category = category || galleryItem.category;

      // Handle new image upload if provided
      if (req.file) {
        // If there's an old image, consider deleting it from Cloudinary to save space
        // You'd need to parse the public ID from galleryItem.imageUrl
        // const publicId = galleryItem.imageUrl.split('/').pop().split('.')[0];
        // await cloudinary.uploader.destroy(`studyhabit_gallery/${publicId}`); // Assuming folder structure

        const newImageUrl = req.file.path; // Path from Multer/Cloudinary upload
        galleryItem.imageUrl = newImageUrl;
      }

      const updatedGalleryItem = await galleryItem.save();
      res.status(200).json(updatedGalleryItem);
    } else {
      res.status(404).json({ message: 'Gallery item not found' });
    }
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ message: 'Server error: Could not update gallery item.' });
  }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryItem = async (req, res) => {
  try {
    const galleryItem = await GalleryItem.findById(req.params.id);

    if (galleryItem) {
      // Delete image from Cloudinary
      const publicId = galleryItem.imageUrl.split('/').pop().split('.')[0]; // Extract public ID
      // Assuming your Cloudinary folder is 'studyhabit_gallery' for consistency
      await cloudinary.uploader.destroy(`studyhabit_gallery/${publicId}`);

      await galleryItem.deleteOne();
      res.status(200).json({ message: 'Gallery item removed successfully' });
    } else {
      res.status(404).json({ message: 'Gallery item not found' });
    }
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ message: 'Server error: Could not delete gallery item.' });
  }
};

export {
  getGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
};