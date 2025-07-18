/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/GalleryManagement.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion'; // Import Variants
import axios from 'axios';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Icons
import { useAuth } from '../../context/AuthContext';

// Define your gallery item interface (should match backend model)
interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'academics' | 'sports' | 'events' | 'facilities' | 'arts' | 'general';
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Define categories for consistent display and form options
const GALLERY_CATEGORIES = [
  'general',
  'academics',
  'sports',
  'events',
  'facilities',
  'arts',
] as const; // 'as const' ensures it's a tuple of literal strings

const API_BASE_URL = 'https://studyhabitcollege.onrender.com/api/gallery';

const GalleryManagement: React.FC = () => {
  const { userInfo } = useAuth();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // For form submission loading
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null); // For specific item delete loading

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<GalleryItem['category']>('general');
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImageUrlPreview, setFormImageUrlPreview] = useState<string | null>(null);

  // Memoized Axios instance with auth headers
  const authAxios = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json', // Default, overridden for multipart
      },
    });

    // Request interceptor to attach token
    instance.interceptors.request.use(
      (config) => {
        if (userInfo?.token) {
          config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, [userInfo?.token]); // Recreate if token changes

  // Framer Motion Variants
  const pageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  const fetchGalleryItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Public route for fetching, so no authAxios needed here unless specified otherwise
      const { data } = await axios.get(API_BASE_URL);
      setGalleryItems(data);
    } catch (err: any) {
      console.error('Error fetching gallery items:', err);
      setError(err.response?.data?.message || 'Failed to load gallery items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  const resetForm = useCallback(() => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('general');
    setFormImage(null);
    if (formImageUrlPreview) {
      URL.revokeObjectURL(formImageUrlPreview); // Clean up old preview URL
    }
    setFormImageUrlPreview(null);
  }, [formImageUrlPreview]);

  const openCreateModal = () => {
    // Check if user is an admin before allowing creation
    if (userInfo?.role !== 'admin') {
      setError('You are not authorized to add new photos. Only administrators can perform this action.');
      return;
    }
    setEditingItem(null);
    resetForm(); // Ensure form is clean for new item
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    // Check if user is an admin before allowing editing
    if (userInfo?.role !== 'admin') {
      setError('You are not authorized to edit photos. Only administrators can perform this action.');
      return;
    }
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormCategory(item.category);
    setFormImage(null); // User must re-upload if changing, don't pre-fill File object
    setFormImageUrlPreview(item.imageUrl); // Show current image for preview
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setError(null); // Clear any modal-specific errors on close
    resetForm(); // Reset form state completely after closing
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormImage(file);
      // Revoke previous URL if exists to prevent memory leaks
      if (formImageUrlPreview) {
        URL.revokeObjectURL(formImageUrlPreview);
      }
      setFormImageUrlPreview(URL.createObjectURL(file));
    } else {
      setFormImage(null);
      if (formImageUrlPreview) {
        URL.revokeObjectURL(formImageUrlPreview);
      }
      setFormImageUrlPreview(editingItem?.imageUrl || null); // Revert to existing image if editing and no new file selected
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userInfo?.role !== 'admin') {
      setError('Authorization failed. Only administrators can perform this action.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', formTitle);
    formData.append('description', formDescription);
    formData.append('category', formCategory);
    if (formImage) {
      formData.append('image', formImage); // 'image' must match multer field name
    } else if (!editingItem) {
      // If creating a new item and no image is selected
      setError('An image is required for new gallery items.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingItem) {
        await authAxios.put(`/${editingItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }, // Override for file upload
        });
        alert('Gallery item updated successfully! 🎉');
      } else {
        await authAxios.post('/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }, // Override for file upload
        });
        alert('Gallery item created successfully! 📸');
      }
      closeModal();
      fetchGalleryItems(); // Refresh list
    } catch (err: any) {
      console.error('Error submitting gallery item:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to save gallery item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (userInfo?.role !== 'admin') {
      alert('Authorization failed. Only administrators can perform this action.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${title}" from the gallery? This action cannot be undone.`)) {
      setDeleteLoadingId(id);
      setError(null);
      try {
        await authAxios.delete(`/${id}`);
        setGalleryItems((prevItems) => prevItems.filter((item) => item._id !== id)); // Optimistic UI update
        alert('Gallery item deleted successfully! 🗑️');
      } catch (err: any) {
        console.error('Error deleting gallery item:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to delete gallery item.');
        alert(`Failed to delete item: ${err.response?.data?.message || 'Please try again.'}`);
      } finally {
        setDeleteLoadingId(null);
      }
    }
  };

  const isAdmin = userInfo?.role === 'admin';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans antialiased text-gray-800 rounded-lg shadow-inner"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 mb-4 sm:mb-0 flex items-center">
          <i className="fas fa-images mr-3 text-purple-500"></i> Gallery Management
        </h2>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 flex items-center justify-center font-semibold text-lg"
          >
            <PlusCircleIcon className="h-6 w-6 mr-2 text-white" /> Add New Photo
          </motion.button>
        )}
      </div>

      <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl">
        Manage the college's visual gallery. As an administrator, you can add, edit, and delete photos across various categories.
      </p>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-lg border border-blue-100 animate-pulse-fade">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Loading gallery... 🖼️</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 px-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl shadow-md">
          <p className="text-2xl font-bold mb-3 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i> Error!
          </p>
          <p className="text-lg mb-4">{error}</p>
          <p className="text-md text-red-700 font-semibold">
            {isAdmin ? 'Please check your network or try again.' : 'You do not have the necessary permissions to view or manage this content.'}
          </p>
          <button
            onClick={fetchGalleryItems}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
          >
            <i className="fas fa-redo-alt mr-2"></i> Retry
          </button>
        </div>
      )}

      {/* No Items Found State */}
      {!loading && !error && galleryItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 px-6 bg-indigo-50 rounded-xl shadow-inner border-2 border-indigo-200"
        >
          <p className="text-2xl font-bold text-indigo-700 mb-4 flex items-center justify-center">
            <i className="fas fa-box-open mr-3 text-indigo-500"></i> No Gallery Items Yet!
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            The gallery is empty. {isAdmin && 'Click "Add New Photo" to upload the first image! 🚀'}
          </p>
        </motion.div>
      )}

      {/* Gallery Grid */}
      {!loading && !error && galleryItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
          <AnimatePresence>
            {galleryItems.map((item) => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit" // Apply exit animation
                layout // Animate position changes when items are added/removed
                className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-200"
              >
                <div className="relative w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300/e0e0e0/888888?text=Image+Missing';
                      e.currentTarget.alt = 'Image not available';
                    }}
                  />
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-800 mb-1 line-clamp-2" title={item.title}>{item.title}</h3>
                    <p className="text-sm text-gray-700 line-clamp-3 mb-3">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between mt-2">
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 sm:mt-0">
                      Uploaded by: <span className="font-medium">{item.uploadedBy.firstName}</span>
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex justify-end p-3 border-t border-gray-100 bg-gray-50 space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openEditModal(item)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      title="Edit Item"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(item._id, item.title)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Item"
                      disabled={deleteLoadingId === item._id}
                    >
                      {deleteLoadingId === item._id ? (
                        <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <TrashIcon className="h-5 w-5" />
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 sm:p-6 z-[9999]" // Increased z-index
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg relative border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
                {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
              </h3>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors"
                    required
                    maxLength={100}
                    placeholder="e.g., Annual Sports Day"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    id="description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors resize-y"
                    required
                    maxLength={500}
                    placeholder="Provide a brief description of the photo."
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select
                    id="category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GalleryItem['category'])}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-colors cursor-pointer"
                    required
                  >
                    {GALLERY_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-1">Image {editingItem ? '(Optional - Upload new to change)' : <span className="text-red-500">*</span>}</label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100 cursor-pointer"
                    required={!editingItem} // Image is required only for new items
                  />
                  {(formImageUrlPreview || editingItem?.imageUrl) && (
                    <div className="mt-4 w-40 h-40 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center bg-gray-100 p-2">
                      <img
                        src={formImageUrlPreview || editingItem?.imageUrl}
                        alt="Image Preview"
                        className="max-w-full max-h-full object-contain rounded-sm"
                      />
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingItem ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingItem ? 'Update Item' : 'Create Item'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GalleryManagement;