/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/student/AnnouncementsPage.tsx
import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Adjust path
import { motion, easeOut } from 'framer-motion'; // Import motion and easeOut
import { useAuth } from '../../../context/AuthContext'; // Import useAuth to get user token

interface PostedBy {
  firstName: string;
  lastName: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  datePosted: string;
  postedBy?: PostedBy;
  targetAudience: string;
}

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { userInfo } = useAuth(); // Get user info from context

  useEffect(() => {
    const fetchAnnouncements = async () => {
      // Basic validation for token existence
      if (!userInfo?.token) {
        setError('Authentication required to view announcements.');
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
        // Ensure the API endpoint is correct for fetching announcements for the logged-in student
        const response = await api.get('/students/me/announcements', config); // Assuming this is the correct endpoint

        const data = response.data;
        if (Array.isArray(data)) {
          setAnnouncements(data);
        } else if (data && Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements); // Handle nested structure if API returns it
        } else {
          setAnnouncements([]); // Default to empty array if unexpected format
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching announcements:', err);
        setError(err.response?.data?.message || 'Failed to load announcements. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (userInfo?.token) { // Only fetch if token exists
      fetchAnnouncements();
    }
  }, [userInfo]); // Depend on userInfo to re-fetch if token changes

  // Framer Motion variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading announcements... <span className="italic">Stay tuned!</span></p>
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
        <p className="text-sm mt-3 text-red-500">Please ensure you are logged in and have the necessary permissions.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="announcements-page p-4 sm:p-0" // Add responsive padding
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-bullhorn mr-3 text-yellow-500"></i> Announcements
      </h2>
      <p className="text-gray-700 mb-8 text-lg">
        Stay updated with the latest news, events, and important information from the school administration and your teachers.
      </p>

      {announcements.length === 0 ? (
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
            There are no new announcements for you at the moment. Please check back later.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-6"
          variants={pageVariants} // Use pageVariants as container for staggered children
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1 }} // Stagger children for smooth entry
        >
          {announcements.map((announcement) => (
            <motion.div
              key={announcement._id}
              variants={itemVariants}
              whileHover={{ y: -3, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col"
            >
              <h3 className="text-xl font-bold text-blue-700 mb-2 flex items-center">
                <i className="fas fa-sticky-note mr-3 text-purple-500"></i> {announcement.title}
              </h3>
              <p className="text-gray-700 mt-1 mb-3 text-base leading-relaxed flex-grow">
                {announcement.content}
              </p>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                <p className="mb-2 sm:mb-0">
                  <i className="fas fa-user-circle mr-2 text-gray-400"></i>
                  Posted by:{' '}
                  <span className="font-semibold text-gray-700">
                    {announcement.postedBy ? `${announcement.postedBy.firstName} ${announcement.postedBy.lastName}` : 'Administrator'}
                  </span>
                </p>
                <p>
                  <i className="fas fa-calendar-alt mr-2 text-gray-400"></i>
                  on:{' '}
                  <span className="font-semibold text-gray-700">
                    {new Date(announcement.datePosted).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </p>
                <p className="mt-2 sm:mt-0">
                  <i className="fas fa-bullseye mr-2 text-gray-400"></i>
                  Target:{' '}
                  <span className={`font-semibold ${announcement.targetAudience === 'Students' ? 'text-green-600' : 'text-blue-600'}`}>
                    {announcement.targetAudience}
                  </span>
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnnouncementsPage;