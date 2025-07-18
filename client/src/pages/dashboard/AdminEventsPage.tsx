/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminEventsPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // Import AnimatePresence and easeOut
import EventFormModal from '../../components/modals/EventFormModal'; // Import the modal

interface Event {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizer: { _id: string; firstName: string; lastName: string };
  targetAudience: string[];
  createdAt: string;
}

const AdminEventsPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null); // For editing
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!userInfo?.token) {
      setError('Authentication required: Please log in to manage events.');
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
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/events', config);
      // Ensure data is an array or handle nested array if API sends it that way
      const eventsData = Array.isArray(data) ? data : (data && Array.isArray(data.events) ? data.events : []);
      setEvents(eventsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to fetch events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.token]); // Depend on userInfo.token to refetch when authentication state changes

  const handleAddEventClick = () => {
    setSelectedEvent(null); // Clear selected event for a new creation
    setIsModalOpen(true);
  };

  const handleEditEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    setIsModalOpen(false); // Close modal after saving
    await fetchEvents(); // Re-fetch events to update the list
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!userInfo?.token) {
      setError('Authentication required to delete events.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the event: "${eventTitle}"? This action cannot be undone.`)) {
      setDeleteLoading(eventId);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/events/${eventId}`, config);
        await fetchEvents(); // Refresh the list
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete event.');
        console.error(err);
      } finally {
        setDeleteLoading(null);
      }
    }
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

  // Determine if the current user is an admin
  const isAdmin = userInfo?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading events... <span className="italic">Please wait.</span></p>
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
        <p className="text-sm mt-3 text-red-500">Please ensure you are logged in and have administrator privileges.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="admin-events-page p-4 sm:p-6" // Add responsive padding
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 flex items-center">
          <i className="fas fa-calendar-alt mr-3 text-yellow-500"></i> Manage Events
        </h2>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddEventClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center text-lg font-semibold"
          >
            <i className="fas fa-plus mr-2"></i> Create New Event
          </motion.button>
        )}
      </div>

      <p className="text-gray-700 mb-8 text-lg">
        Oversee and manage all school events and activities. As an administrator, you can create, edit, and delete events.
      </p>

      {events.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 bg-blue-50 rounded-lg shadow-inner border border-blue-200"
        >
          <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
            <i className="fas fa-calendar-times mr-3 text-blue-500"></i> No Events Scheduled Yet!
          </p>
          <p className="text-gray-600">
            There are no events in the system. {isAdmin && 'Click "Create New Event" to add the first one!'}
          </p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-heading mr-2"></i> Title
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-calendar-alt mr-2"></i> Dates
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-map-marker-alt mr-2"></i> Location
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-users mr-2"></i> Audience
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-user-tie mr-2"></i> Organizer
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
                {events.map((event) => (
                  <motion.tr
                    key={event._id}
                    layout // Animate position changes
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -50 }} // Animation when an item is removed
                    variants={itemVariants}
                    transition={{ duration: 0.3 }}
                    whileHover={{ backgroundColor: '#f3f4f6', scale: 1.005 }}
                    className="hover:shadow-sm"
                  >
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <span className="font-bold text-blue-700">{event.title}</span>
                      {event.description && <p className="text-xs text-gray-500 italic mt-1 max-w-sm truncate">{event.description}</p>}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {new Date(event.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} -{' '}
                      {new Date(event.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <span className="inline-flex items-center">
                        {event.location || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {event.targetAudience.length > 0 ? (
                        event.targetAudience.map((aud) => (
                          <span key={aud} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1 font-medium">
                            {aud.charAt(0).toUpperCase() + aud.slice(1)}
                          </span>
                        ))
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">All</span>
                      )}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <span className="font-semibold text-gray-800">{event.organizer?.firstName} {event.organizer?.lastName}</span>
                      <p className="text-xs text-gray-500">
                        <i className="fas fa-calendar-plus mr-1"></i> Posted: {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditEventClick(event)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-1 rounded-full hover:bg-indigo-50"
                            title="Edit Event"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id, event.title)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded-full hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={deleteLoading === event._id}
                            title="Delete Event"
                          >
                            {deleteLoading === event._id ? (
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
            <EventFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              eventToEdit={selectedEvent}
              onSave={handleSaveEvent}
            />
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default AdminEventsPage;