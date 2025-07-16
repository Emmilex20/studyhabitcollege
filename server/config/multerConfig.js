// server/config/multerConfig.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary'; // Import cloudinary

// Configure Cloudinary (ensure these are loaded via .env in your app.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2, // Use v2 of cloudinary
  params: {
    folder: 'studyhabit_gallery', // Folder name in your Cloudinary account
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }], // Optional: auto-resize on upload
  },
});

const upload = multer({ storage: storage });

export { upload };