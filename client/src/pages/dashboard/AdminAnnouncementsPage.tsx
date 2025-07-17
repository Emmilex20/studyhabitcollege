/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminAnnouncementsPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import AnnouncementFormModal from '../../components/modals/AnnouncementFormModal';

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
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const isAdmin = userInfo?.role === 'admin';

  // --- DEBUGGING LOGS: Initial Component State ---
  console.log('--- AdminAnnouncementsPage Render ---');
  console.log('userInfo:', userInfo);
  console.log('isAdmin (derived from userInfo):', isAdmin);
  console.log('Current announcements state (before useEffect):', announcements);
  console.log('Current loading state (before useEffect):', loading);
  console.log('Current error state (before useEffect):', error);
  // --- END DEBUGGING LOGS ---

  const fetchAnnouncements = async () => {
    if (!userInfo?.token) {
      console.warn('Authentication token missing. Cannot fetch announcements.'); // More descriptive warning
      setError('User not authenticated or token missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/announcements', config);
      console.log('🥳 API response data for announcements:', data); // CRUCIAL LOG: What did the backend send?
      setAnnouncements(data);
      setError(null);
    } catch (err: any) {
      console.error('❌ Failed to fetch announcements:', err.response?.data?.message || err.message, err); // Log full error details
      setError(err.response?.data?.message || 'Failed to fetch announcements.');
    } finally {
      setLoading(false);
      console.log('🏁 Fetch announcements complete. New loading state:', false);
    }
  };

  useEffect(() => {
    console.log('🚀 useEffect triggered. Calling fetchAnnouncements...');
    fetchAnnouncements();
    // userInfo is in the dependency array to refetch if user logs in/out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.token]); // Depend only on userInfo.token if that's what triggers a re-fetch

  const handleAddAnnouncementClick = () => {
    setSelectedAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleEditAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    // This function is called after a successful create/edit in the modal
    // It refetches all announcements to update the list.
    await fetchAnnouncements();
  };

  const handleDeleteAnnouncement = async (announcementId: string, announcementTitle: string) => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
      return;
    }
    if (
      window.confirm(`Are you sure you want to delete the announcement: "${announcementTitle}"? This action cannot be undone.`)
    ) {
      setDeleteLoading(announcementId);
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/announcements/${announcementId}`, config);
        console.log(`✅ Announcement "${announcementTitle}" deleted.`);
        await fetchAnnouncements(); // Refresh the list after deletion
      } catch (err: any) {
        console.error('❌ Failed to delete announcement:', err.response?.data?.message || err.message, err);
        setError(err.response?.data?.message || 'Failed to delete announcement.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    // Ensure comparison is always to the current date, not creation date
    return new Date(expiryDate) < new Date();
  };

  // --- CONDITIONAL RENDERING FOR LOADING/ERROR STATES ---
  if (loading) {
    console.log('Component is in loading state. Displaying loading message.');
    return <div className="text-center py-10 text-gray-600">Loading announcements...</div>;
  }
  if (error) {
    console.log('Component is in error state. Displaying error message:', error);
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }
  // --- END CONDITIONAL RENDERING ---

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="admin-announcements-page p-6 bg-gray-100 min-h-screen"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Manage Announcements</h2>
      <p className="text-gray-700 mb-4">
        View important announcements. {isAdmin && 'Only admins can create, edit or delete.'}
      </p>

      {isAdmin && (
        <button
          onClick={handleAddAnnouncementClick}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> Create New Announcement
        </button>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Content
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Audience
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Published On
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Expires On
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Author
              </th>
              {isAdmin && (
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {announcements.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center text-gray-500">
                  No announcements found. {isAdmin && 'Click "Create New Announcement" to add one.'}
                </td>
              </tr>
            ) : (
              announcements.map((announcement) => (
                <tr key={announcement._id} className={isExpired(announcement.expiryDate) ? 'bg-gray-50 opacity-70' : ''}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className="font-bold">{announcement.title}</span>
                    {isExpired(announcement.expiryDate) && (
                      <span className="ml-2 text-xs text-red-500 font-semibold">(Expired)</span>
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {announcement.content}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {announcement.targetAudience.map((aud) => (
                      <span
                        key={aud}
                        className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                      >
                        {aud.charAt(0).toUpperCase() + aud.slice(1)}
                      </span>
                    ))}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {new Date(announcement.datePublished).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {announcement.expiryDate ? new Date(announcement.expiryDate).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {announcement.author?.firstName} {announcement.author?.lastName}
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm flex items-center">
                      <button
                        onClick={() => handleEditAnnouncementClick(announcement)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement._id, announcement.title)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={deleteLoading === announcement._id}
                      >
                        {deleteLoading === announcement._id ? (
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* This message will only show if the table is empty AND it's not loading/erroring, which is handled by the tbody already */}
      {/* Keeping it here for clarity, but the tbody handles the primary "no announcements" display */}
      {announcements.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500 mt-4">
          No announcements found. {isAdmin && 'Create a new announcement!'}
        </p>
      )}

      {isAdmin && (
        <AnnouncementFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          announcementToEdit={selectedAnnouncement}
          onSave={handleSaveAnnouncement}
        />
      )}
    </motion.div>
  );
};

export default AdminAnnouncementsPage;