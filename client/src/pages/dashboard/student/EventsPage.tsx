/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/student/EventsPage.tsx
import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Adjust path
import { motion, easeOut } from 'framer-motion'; // Import motion and easeOut
import { useAuth } from '../../../context/AuthContext'; // Import useAuth to get user token

interface Event {
  _id: string;
  name: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  targetAudience: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { userInfo } = useAuth(); // Get user info from context

  useEffect(() => {
    const fetchEvents = async () => {
      // Basic validation for token existence
      if (!userInfo?.token) {
        setError('Authentication required to view events.');
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
        // Assuming this is the correct endpoint for student-specific events
        const response = await api.get('/students/me/events', config);

        const data = response.data;
        if (Array.isArray(data)) {
          // Filter out past events to only show "upcoming"
          const upcomingEvents = data.filter((event: Event) =>
            new Date(event.endDate || event.eventDate) >= new Date()
          );
          setEvents(upcomingEvents);
        } else if (data && Array.isArray(data.events)) {
          // Filter out past events from a nested structure
          const upcomingEvents = data.events.filter((event: Event) =>
            new Date(event.endDate || event.eventDate) >= new Date()
          );
          setEvents(upcomingEvents);
        } else {
          setEvents([]); // Default to empty array if unexpected format
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.response?.data?.message || 'Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (userInfo?.token) { // Only fetch if token exists
      fetchEvents();
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
        <p className="ml-4 text-lg text-gray-600">Loading events... <span className="italic">Get ready for some fun!</span></p>
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
          <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Events!
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
      className="events-page p-4 sm:p-0" // Add responsive padding
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-calendar-check mr-3 text-yellow-500"></i> Upcoming Events
      </h2>
      <p className="text-gray-700 mb-8 text-lg">
        Check out the exciting events happening around campus and in your community. Don't miss out!
      </p>

      {events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 bg-blue-50 rounded-lg shadow-inner border border-blue-200"
        >
          <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
            <i className="fas fa-calendar-alt mr-3 text-blue-500"></i> No Upcoming Events Found!
          </p>
          <p className="text-gray-600">
            There are no new events scheduled at the moment. Please check back later.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={pageVariants} // Use pageVariants as container for staggered children
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1 }} // Stagger children for smooth entry
        >
          {events.map((event) => (
            <motion.div
              key={event._id}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-full"
            >
              <h3 className="text-xl font-bold text-blue-700 mb-2 flex items-center">
                <i className="fas fa-calendar-day mr-3 text-purple-500"></i> {event.name}
              </h3>
              <p className="text-gray-700 mt-1 mb-3 text-base leading-relaxed flex-grow">
                {event.description || 'No description provided.'}
              </p>
              <div className="text-sm text-gray-600 space-y-2 mt-auto pt-4 border-t border-gray-100">
                <p className="flex items-center">
                  <i className="fas fa-clock mr-2 text-green-500"></i>
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(event.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                </p>
                {event.location && (
                  <p className="flex items-center">
                    <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>
                    <span className="font-semibold">Location:</span> {event.location}
                  </p>
                )}
                <p className="flex items-center">
                  <i className="fas fa-users mr-2 text-orange-500"></i>
                  <span className="font-semibold">Target:</span>{' '}
                  <span className={`font-semibold ${event.targetAudience === 'Students' ? 'text-green-600' : 'text-blue-600'}`}>
                    {event.targetAudience}
                  </span>
                </p>
              </div>
              {/* Optional: Add a "View Details" button or link */}
              <div className="mt-5 text-right">
                <button
                  onClick={() => alert(`Viewing details for ${event.name}`)}
                  className="inline-flex items-center px-5 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  More Info <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EventsPage;