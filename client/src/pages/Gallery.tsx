import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, easeOut, type Transition } from 'framer-motion';
import axios from 'axios'; // Import axios for API calls

// --- 1. Define GalleryItem interface based on your BACKEND MODEL ---
// This interface should match the structure returned by your backend's /api/gallery endpoint
interface GalleryItem {
  _id: string; // Use _id from MongoDB
  title: string;
  description: string;
  imageUrl: string; // This will be the URL from Cloudinary or your server
  category: 'academics' | 'sports' | 'events' | 'facilities' | 'arts' | 'general'; // Ensure 'general' is included if used
  uploadedBy?: { // Optional, depending on if you always populate this
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// --- 2. Define your API Base URL ---
const API_BASE_URL = 'http://localhost:5000/api/gallery'; // Adjust if your backend is on a different port/domain

// Animation Variants (easeOut is correctly used here)
const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3, ease: easeOut } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: easeOut } },
};

const modalVariants = {
  hidden: { opacity: 0, y: "100vh", scale: 0.5 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20,
      ease: easeOut
    } as Transition
  },
  exit: { opacity: 0, y: "100vh", scale: 0.5, transition: { duration: 0.3, ease: easeOut } },
};

const Gallery: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]); // State to hold fetched data
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]); // Filtered items state
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // --- Fetch data from backend on component mount ---
  useEffect(() => {
    const fetchGalleryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(API_BASE_URL);
        // Assuming your backend returns an array of gallery items directly
        setGalleryItems(response.data);
        setFilteredItems(response.data); // Initialize filtered items with all data
      } catch (err) {
        console.error('Error fetching gallery data:', err);
        setError('Failed to load gallery items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []); // Empty dependency array means this runs once on mount

  // --- Filter items when activeCategory or galleryItems changes ---
  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredItems(galleryItems);
    } else {
      setFilteredItems(galleryItems.filter(item => item.category === activeCategory));
    }
  }, [activeCategory, galleryItems]); // Depend on both category and the full list

  // Define categories (ensure 'general' is listed if your backend uses it)
  const categories = [
    { name: 'All', value: 'all' },
    { name: 'Academics', value: 'academics' },
    { name: 'Sports', value: 'sports' },
    { name: 'Events', value: 'events' },
    { name: 'Facilities', value: 'facilities' },
    { name: 'Arts & Culture', value: 'arts' },
    { name: 'General', value: 'general' }, // Added 'General' category
  ];

  const openModal = (item: GalleryItem) => {
    setSelectedImage(item);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 text-gray-800">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-20 md:py-28 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-pattern opacity-10" style={{ backgroundImage: "url('/pattern-light.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut }}
          >
            Our Gallery 📸
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl max-w-3xl mx-auto opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
          >
            Explore the vibrant life and dynamic environment of Studyhabit College through our captivating photo gallery.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10 p-4 bg-white rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: easeOut }}
        >
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`
                px-6 py-2 rounded-full font-semibold text-sm md:text-base
                transition-all duration-300 ease-in-out transform hover:scale-105
                ${activeCategory === category.value
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-purple-100'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Loading and Error States */}
        {loading && (
            <div className="text-center text-lg text-indigo-600 py-10">
                <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading captivating moments...
            </div>
        )}
        {error && (
            <div className="text-center text-red-500 text-lg py-10">
                <p>⚠️ {error}</p>
                <p className="text-sm text-gray-500 mt-2">Please check your internet connection or try again later.</p>
            </div>
        )}

        {/* Gallery Grid */}
        {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center text-gray-600 text-lg py-10">
                No items found in this category. ✨
            </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item._id} // Use _id from backend data
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout // Enables smooth transitions when items are added/removed
                  className="relative group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  onClick={() => openModal(item)}
                >
                  <img
                    src={item.imageUrl} // Use imageUrl from backend
                    alt={item.title}
                    className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    loading="lazy" // Optimize image loading
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        // Fallback image if actual image fails to load
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-bold group-hover:text-yellow-300 transition-colors duration-300">{item.title}</h3>
                    <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-20 overflow-hidden line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Image Modal/Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 cursor-zoom-out"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeModal}
          >
            <motion.div
              className="relative bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl max-h-[90vh] w-full flex flex-col md:flex-row cursor-default"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 text-2xl z-10"
                aria-label="Close image"
              >
                &times;
              </button>
              <div className="md:w-3/5 lg:w-2/3 flex-shrink-0 relative">
                <img
                  src={selectedImage.imageUrl} // Use imageUrl from backend
                  alt={selectedImage.title}
                  className="w-full h-full object-contain md:object-cover max-h-[60vh] md:max-h-[unset]"
                />
              </div>
              <div className="md:w-2/5 lg:w-1/3 p-6 flex flex-col text-gray-800">
                <h3 className="text-2xl font-bold text-purple-700 mb-3">{selectedImage.title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">{selectedImage.description}</p>
                <div className="text-xs text-gray-500 mt-auto">
                  <p>Category: <span className="font-semibold capitalize">{selectedImage.category}</span></p>
                  <p>Uploaded By: <span className="font-semibold">{selectedImage.uploadedBy?.firstName} {selectedImage.uploadedBy?.lastName}</span></p>
                  <p>Uploaded On: <span className="font-semibold">{new Date(selectedImage.createdAt).toLocaleDateString()}</span></p>
                  {/* <p>ID: {selectedImage._id}</p> // You might not want to show this to users */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;