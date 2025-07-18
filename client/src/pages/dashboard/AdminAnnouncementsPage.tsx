/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminAnnouncementsPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // Import AnimatePresence and easeOut
import AnnouncementFormModal from '../../components/modals/AnnouncementFormModal'; // Assuming this modal handles create/edit

interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: { _id: string; firstName: string; lastName: string };
  datePublished: string;
  targetAudience: string[];
  expiryDate?: string;
  createdAt: string;
}

const AdminAnnouncementsPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null); // For editing
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Determine if the current user is an admin
  const isAdmin = userInfo?.role === 'admin';

  const fetchAnnouncements = async () => {
    if (!userInfo?.token) {
      setError('Authentication required: Please log in to manage announcements.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/announcements', config);
      // Ensure data is an array or handle nested array if API sends it that way
      const announcementsData = Array.isArray(data) ? data : (data && Array.isArray(data.announcements) ? data.announcements : []);
      setAnnouncements(announcementsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching announcements:', err.response?.data?.message || err.message, err);
      setError(err.response?.data?.message || 'Failed to fetch announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // userInfo.token is in the dependency array to refetch if user logs in/out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.token]);

  const handleAddAnnouncementClick = () => {
    setSelectedAnnouncement(null); // Clear selected announcement for a new creation
    setIsModalOpen(true);
  };

  const handleEditAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    setIsModalOpen(false); // Close modal after saving
    await fetchAnnouncements(); // Re-fetch announcements to update the list
  };

  const handleDeleteAnnouncement = async (announcementId: string, announcementTitle: string) => {
    if (!userInfo?.token) {
      setError('Authentication required to delete announcements.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the announcement: "${announcementTitle}"? This action cannot be undone.`)) {
      setDeleteLoading(announcementId);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/announcements/${announcementId}`, config);
        await fetchAnnouncements(); // Refresh the list after deletion
      } catch (err: any) {
        console.error('Failed to delete announcement:', err.response?.data?.message || err.message, err);
        setError(err.response?.data?.message || 'Failed to delete announcement.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false; // Announcements without an expiry date never expire
    // Compare the expiry date to the current date, ignoring time for a simple check
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const expDate = new Date(expiryDate);
    expDate.setHours(0, 0, 0, 0); // Normalize to start of day
    return expDate < today;
  };

  // Framer Motion variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // --- CONDITIONAL RENDERING FOR LOADING/ERROR STATES ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading announcements... <span className="italic">Getting the latest news!</span></p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
      >
        <p className="text-xl font-semibold mb-2 flex items-center justify-center">
          <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Announcements!
        </p>
        <p>{error}</p>
        <p className="text-sm mt-3 text-red-500">Please ensure you are logged in and have administrator privileges.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="admin-announcements-page p-4 sm:p-6" // Add responsive padding
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 flex items-center">
          <i className="fas fa-bullhorn mr-3 text-yellow-500"></i> Announcements
        </h2>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddAnnouncementClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center text-lg font-semibold"
          >
            <i className="fas fa-plus mr-2"></i> Create New Announcement
          </motion.button>
        )}
      </div>

      <p className="text-gray-700 mb-8 text-lg">
        Oversee and manage all official school announcements. As an administrator, you can create, edit, and delete announcements.
      </p>

      {announcements.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 bg-blue-50 rounded-lg shadow-inner border border-blue-200"
        >
          <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Announcements Found!
          </p>
          <p className="text-gray-600">
            There are no announcements in the system. {isAdmin && 'Click "Create New Announcement" to add the first one!'}
          </p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-bullhorn mr-2"></i> Title
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-align-left mr-2"></i> Content
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-users mr-2"></i> Audience
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-calendar-plus mr-2"></i> Published On
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-calendar-times mr-2"></i> Expires On
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-user-tie mr-2"></i> Author
                </th>
                {isAdmin && (
                  <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <i className="fas fa-cogs mr-2"></i> Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              <AnimatePresence> {/* For exit animations when items are deleted */}
                {announcements.map((announcement) => (
                  <motion.tr
                    key={announcement._id}
                    layout // Animate position changes
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -50 }} // Animation when an item is removed
                    variants={itemVariants}
                    transition={{ duration: 0.3 }}
                    whileHover={{ backgroundColor: '#f3f4f6', scale: 1.005 }}
                    className={`hover:shadow-sm ${isExpired(announcement.expiryDate) ? 'bg-gray-50 text-gray-500 opacity-80 italic' : ''}`}
                  >
                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                      <span className={`font-bold ${isExpired(announcement.expiryDate) ? 'text-gray-600' : 'text-blue-700'}`}>{announcement.title}</span>
                      {isExpired(announcement.expiryDate) && (
                        <span className="ml-2 text-xs text-red-500 font-semibold">(Expired)</span>
                      )}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 text-sm max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      {announcement.content}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                      {announcement.targetAudience.length > 0 ? (
                        announcement.targetAudience.map((aud) => (
                          <span key={aud} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1 mb-1 font-medium">
                            {aud.charAt(0).toUpperCase() + aud.slice(1)}
                          </span>
                        ))
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">All</span>
                      )}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                      <span className="font-semibold">{new Date(announcement.datePublished).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <p className="text-xs text-gray-500">
                        {new Date(announcement.datePublished).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                      {announcement.expiryDate ? (
                        <span className={`font-semibold ${isExpired(announcement.expiryDate) ? 'text-red-600' : 'text-green-600'}`}>
                          {new Date(announcement.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-gray-500">Never</span>
                      )}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                      <span className="font-semibold text-gray-800">{announcement.author?.firstName} {announcement.author?.lastName}</span>
                      <p className="text-xs text-gray-500">
                        <i className="fas fa-calendar-check mr-1"></i> Created: {new Date(announcement.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4 border-b border-gray-200 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditAnnouncementClick(announcement)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-1 rounded-full hover:bg-indigo-50"
                            title="Edit Announcement"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement._id, announcement.title)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded-full hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={deleteLoading === announcement._id}
                            title="Delete Announcement"
                          >
                            {deleteLoading === announcement._id ? (
                              <i className="fas fa-spinner fa-spin"></i> // Spinner for deleting state
                            ) : (
                              <i className="fas fa-trash-alt"></i>
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for admin only */}
      {isAdmin && (
        <AnimatePresence>
          {isModalOpen && (
            <AnnouncementFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              announcementToEdit={selectedAnnouncement}
              onSave={handleSaveAnnouncement}
            />
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default AdminAnnouncementsPage;