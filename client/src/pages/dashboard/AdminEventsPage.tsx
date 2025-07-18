/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminEventsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import EventFormModal from '../../components/modals/EventFormModal';

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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Framer Motion Variants for page entry
  const pageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  // Framer Motion Variants for table rows
  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  const fetchEvents = useCallback(async () => {
    if (!userInfo?.token) {
      setError('Authentication required to fetch events.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/events', config);
      const eventsData = Array.isArray(data) ? data : (data && Array.isArray(data.events) ? data.events : []);
      setEvents(eventsData);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      let errorMessage = 'Failed to fetch events. Please try again.';
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = 'You are not authorized to access event data. Please log in.';
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAddEventClick = () => {
    if (!isAdminOrTeacher) {
      alert('You are not authorized to create events.');
      return;
    }
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEventClick = (event: Event) => {
    if (!isAdminOrTeacher) {
      alert('You are not authorized to edit events.');
      return;
    }
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    setIsModalOpen(false);
    await fetchEvents();
    alert('Event saved successfully! ✅');
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!isAdminOrTeacher) {
      alert('You are not authorized to delete events.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the event: "${eventTitle}"? This action cannot be undone.`)) {
      setDeleteLoading(eventId);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/events/${eventId}`, config);
        await fetchEvents();
        alert('Event deleted successfully! 🗑️');
      } catch (err: any) {
        console.error('Error deleting event:', err);
        let errorMessage = 'Failed to delete event.';
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            errorMessage = 'You are not authorized to delete this event.';
          } else {
            errorMessage = err.response.data?.message || errorMessage;
          }
        }
        setError(errorMessage);
        alert(`Error deleting event: ${errorMessage}`);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  // Determine if the current user is an admin or teacher
  const isAdminOrTeacher = userInfo?.role === 'admin' || userInfo?.role === 'teacher';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="admin-events-page p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans antialiased text-gray-800 rounded-lg shadow-inner"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4 sm:mb-0 flex items-center">
          <i className="fas fa-calendar-alt mr-3 text-yellow-500"></i> Manage Events
        </h2>
        {isAdminOrTeacher && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddEventClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 flex items-center justify-center font-semibold text-lg"
          >
            <i className="fas fa-plus mr-2 text-white"></i> Create New Event
          </motion.button>
        )}
      </div>

      <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl">
        Oversee and manage all school events and activities.
        {isAdminOrTeacher && ' As an administrator or teacher, you can create, edit, and delete events.'}
        {!isAdminOrTeacher && ' You can view all scheduled events here.'}
      </p>

      {loading && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-lg border border-blue-100 animate-pulse-fade">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Loading events... Please wait. 🗓️</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12 px-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl shadow-md">
          <p className="text-2xl font-bold mb-3 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i> Error Loading Events!
          </p>
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
          >
            <i className="fas fa-redo-alt mr-2"></i> Retry Fetching Events
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 px-6 bg-blue-50 rounded-xl shadow-inner border-2 border-blue-200"
        >
          <p className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center">
            <i className="fas fa-calendar-times mr-3 text-blue-500"></i> No Events Scheduled Yet!
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            There are currently no events in the system.
            <br /> {isAdminOrTeacher && 'Click the "Create New Event" button above to add the first one! 🎉'}
          </p>
        </motion.div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    <i className="fas fa-heading mr-2 text-indigo-500"></i> Title
                  </th>
                  <th scope="col" className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    <i className="fas fa-calendar-alt mr-2 text-purple-500"></i> Dates
                  </th>
                  <th scope="col" className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    <i className="fas fa-map-marker-alt mr-2 text-green-500"></i> Location
                  </th>
                  <th scope="col" className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    <i className="fas fa-users mr-2 text-orange-500"></i> Audience
                  </th>
                  <th scope="col" className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    <i className="fas fa-user-tie mr-2 text-blue-500"></i> Organizer
                  </th>
                  {isAdminOrTeacher && (
                    <th scope="col" className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      <i className="fas fa-cogs mr-2 text-gray-500"></i> Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                <AnimatePresence>
                  {events.map((event) => (
                    <motion.tr
                      key={event._id}
                      layout
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={itemVariants}
                      transition={{ duration: 0.3 }}
                      whileHover={{ backgroundColor: '#f3f4f6', scale: 1.005, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
                      className="hover:shadow-sm"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="font-bold text-blue-700">{event.title}</span>
                        {event.description && <p className="text-xs text-gray-500 italic mt-1 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={event.description}>{event.description}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <p>
                          {new Date(event.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          to {new Date(event.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="inline-flex items-center bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {event.location || 'Online / To be announced'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {event.targetAudience.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {event.targetAudience.map((aud) => (
                              <span key={aud} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                {aud.charAt(0).toUpperCase() + aud.slice(1)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">All Stakeholders</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="font-semibold text-green-700">{event.organizer?.firstName} {event.organizer?.lastName}</span>
                        <p className="text-xs text-gray-500 mt-1">
                          <i className="fas fa-calendar-plus mr-1"></i> Created: {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      {isAdminOrTeacher && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditEventClick(event)}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-2 rounded-full hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              title="Edit Event"
                            >
                              <i className="fas fa-edit text-lg"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event._id, event.title)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded-full hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              disabled={deleteLoading === event._id}
                              title="Delete Event"
                            >
                              {deleteLoading === event._id ? (
                                <i className="fas fa-spinner fa-spin text-lg"></i>
                              ) : (
                                <i className="fas fa-trash-alt text-lg"></i>
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
        </div>
      )}

      {isAdminOrTeacher && (
        <AnimatePresence>
          {isModalOpen && (
            <EventFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              eventToEdit={selectedEvent}
              onSave={handleSaveEvent}
              currentUserId={userInfo?._id}
              userToken={userInfo?.token}
            />
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default AdminEventsPage;