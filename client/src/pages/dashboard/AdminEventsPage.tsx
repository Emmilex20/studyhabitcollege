/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminEventsPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
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
      setError('User not authenticated.');
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
      setEvents(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch events.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  const handleAddEventClick = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    await fetchEvents();
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
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
        await fetchEvents();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete event.');
        console.error(err);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  const isAdmin = userInfo?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="admin-events-page"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Manage Events</h2>
      <p className="text-gray-700 mb-4">View school events and activities. {isAdmin && 'Only admins can create or edit events.'}</p>

      {isAdmin && (
        <button
          onClick={handleAddEventClick}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i> Create New Event
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
                Dates
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Audience
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Organizer
              </th>
              {isAdmin && (
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className="font-bold">{event.title}</span>
                  {event.description && <p className="text-xs text-gray-500 italic mt-1">{event.description}</p>}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {event.location || 'N/A'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {event.targetAudience.map((aud) => (
                    <span key={aud} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                      {aud.charAt(0).toUpperCase() + aud.slice(1)}
                    </span>
                  ))}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {event.organizer?.firstName} {event.organizer?.lastName}
                </td>
                {isAdmin && (
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button
                      onClick={() => handleEditEventClick(event)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id, event.title)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={deleteLoading === event._id}
                    >
                      {deleteLoading === event._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {events.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500 mt-4">No events found. {isAdmin && 'Create a new event!'}</p>
      )}

      {/* Modal for admin only */}
      {isAdmin && (
        <EventFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          eventToEdit={selectedEvent}
          onSave={handleSaveEvent}
        />
      )}
    </motion.div>
  );
};

export default AdminEventsPage;
