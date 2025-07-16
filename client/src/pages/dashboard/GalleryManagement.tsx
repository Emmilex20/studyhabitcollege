/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { easeOut } from 'framer-motion';
import axios from 'axios'; // For API requests
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

const API_BASE_URL = 'https://studyhabitcollege.onrender.com/api/gallery'; // Adjust if your backend runs on a different port/domain

const GalleryManagement: React.FC = () => {
  const { userInfo } = useAuth(); // <--- GET USER INFO FROM AUTH CONTEXT
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<GalleryItem['category']>('general');
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImageUrlPreview, setFormImageUrlPreview] = useState<string | null>(null);


  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const getAuthHeaders = () => {
    // 💡 CORRECTED: Get token from userInfo provided by AuthContext
    const token = userInfo?.token;
    if (!token) {
      console.error('Authentication token is missing. User might not be logged in or token not available.');
      // Handle this case appropriately, e.g., redirect to login or show an error
      setError('You are not authorized. Please log in.');
      return {}; // Return empty headers or throw an error
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', // Important for file uploads
    };
  };

  const fetchGalleryItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // Public route, no auth needed for GET all items.
      // If this route eventually becomes protected, you'd add headers here too.
      const { data } = await axios.get(API_BASE_URL);
      setGalleryItems(data);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      setError('Failed to load gallery items.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    // Check if user is logged in before opening modal for protected actions
    if (!userInfo?.token) {
        setError('You must be logged in to add new photos.');
        return;
    }
    setEditingItem(null); // Clear editing state for create
    setFormTitle('');
    setFormDescription('');
    setFormCategory('general');
    setFormImage(null);
    setFormImageUrlPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    // Check if user is logged in before opening modal for protected actions
    if (!userInfo?.token) {
        setError('You must be logged in to edit photos.');
        return;
    }
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormCategory(item.category);
    setFormImage(null); // Don't pre-fill image, user must re-upload if changing
    setFormImageUrlPreview(item.imageUrl); // Show current image
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setError(null); // Clear any modal-specific errors on close
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormImage(file);
      setFormImageUrlPreview(URL.createObjectURL(file)); // Create a local URL for preview
    } else {
      setFormImage(null);
      setFormImageUrlPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInfo?.token) { // Ensure token is available before proceeding
        setError('You are not authorized. Please log in.');
        return;
    }

    setLoading(true);
    setError(null);

    if (!formImage && !editingItem) { // Image is required for new items
      setError('Image is required for new gallery items.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', formTitle);
    formData.append('description', formDescription);
    formData.append('category', formCategory);
    if (formImage) {
      formData.append('image', formImage); // 'image' must match multer field name
    }

    try {
      if (editingItem) {
        await axios.put(`${API_BASE_URL}/${editingItem._id}`, formData, {
          headers: getAuthHeaders(),
        });
      } else {
        await axios.post(API_BASE_URL, formData, {
          headers: getAuthHeaders(),
        });
      }
      closeModal();
      fetchGalleryItems(); // Refresh list
    } catch (err: any) {
      console.error('Error submitting gallery item:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to save gallery item.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!userInfo?.token) { // Ensure token is available before proceeding
        setError('You are not authorized to delete photos. Please log in.');
        return;
    }

    if (window.confirm('Are you sure you want to delete this gallery item? This action cannot be undone.')) {
      setLoading(true);
      setError(null);
      try {
        await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: {
            Authorization: getAuthHeaders().Authorization, // Only need Authorization for delete
          },
        });
        fetchGalleryItems(); // Refresh list
      } catch (err: any) {
        console.error('Error deleting gallery item:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to delete gallery item.');
      } finally {
        setLoading(false);
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeOut }}
      className="p-6 bg-white rounded-lg shadow-md"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-indigo-700">Manage Gallery</h2>
        <button
          onClick={openCreateModal}
          className="flex items-center bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
        >
          <PlusCircleIcon className="h-6 w-6 mr-2" /> Add New Photo
        </button>
      </div>

      {loading && <p className="text-center text-indigo-500">Loading gallery items...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!loading && !error && galleryItems.length === 0 && (
        <p className="text-center text-gray-600">No gallery items found. Click "Add New Photo" to get started!</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {galleryItems.map((item) => (
          <motion.div
            key={item._id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
          >
            <div className="relative w-full h-48 overflow-hidden bg-gray-200">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'; }}
              />
            </div>
            <div className="p-4 flex-grow">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-700 line-clamp-2 mb-3">{item.description}</p>
              <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
                {item.category}
              </span>
            </div>
            <div className="flex justify-end p-3 border-t border-gray-200 bg-gray-100">
              <button
                onClick={() => openEditModal(item)}
                className="text-blue-600 hover:text-blue-800 transition-colors mr-3"
                title="Edit Item"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Delete Item"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative"
          >
            <h3 className="text-2xl font-bold text-indigo-700 mb-6">
              {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
            </h3>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  id="category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as GalleryItem['category'])}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="general">General</option>
                  <option value="academics">Academics</option>
                  <option value="sports">Sports</option>
                  <option value="events">Events</option>
                  <option value="facilities">Facilities</option>
                  <option value="arts">Arts</option>
                </select>
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required={!editingItem} // Image is required only for new items
                />
                {(formImageUrlPreview || editingItem?.imageUrl) && (
                  <div className="mt-4 w-32 h-32 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
                    <img
                      src={formImageUrlPreview || editingItem?.imageUrl}
                      alt="Image Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  editingItem ? 'Update Item' : 'Create Item'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default GalleryManagement;