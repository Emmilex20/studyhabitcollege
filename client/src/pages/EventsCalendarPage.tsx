// src/pages/EventsCalendarPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, easeOut, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Placeholder for an Events Calendar hero image
import calendarHero from '../assets/calendar-hero.png'; // e.g., a diverse group of students at an event

// Define the type for an event item as it comes from your backend
// This should match the Event interface used in AdminEventsPage and EventFormModal
interface Event {
  _id: string;
  title: string;
  description?: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location?: string;
  organizer: { _id: string; firstName: string; lastName: string };
  targetAudience: string[];
  createdAt: string; // To allow sorting or display creation date
}

// Helper to format dates for display
const formatDateForDisplay = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper to format time (assuming events might have a more specific time if added to backend)
const formatTimeForDisplay = (isoString: string): string => {
  const date = new Date(isoString);
  // If your backend stores a time, extract it. Otherwise, default.
  // For simplicity, we'll just say "All Day" if start and end dates are the same,
  // or imply a range. You might need to adjust this if your backend sends specific times.
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const EventsCalendarPage: React.FC = () => {
  const eventsPerPage = 6;
  const [events, setEvents] = useState<Event[]>([]); // State to hold fetched events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedEventsCount, setDisplayedEventsCount] = useState(eventsPerPage);
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All'); // Changed to string to accommodate dynamic categories

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // No token needed for public events view
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/events/public');
      // Ensure data is an array, or extract events if wrapped in an object like { events: [...] }
      const eventsData = Array.isArray(data) ? data : (data && Array.isArray(data.events) ? data.events : []);

      // Sort events by startDate, closest upcoming first
      const sortedEvents = eventsData.sort((a: Event, b: Event) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });

      setEvents(sortedEvents);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Derive categories from fetched events
  const allCategories = Array.from(new Set(events.flatMap(event => event.targetAudience)));
  const categories = ['All', ...allCategories.filter(cat => cat !== 'all')]; // 'all' can be a category, but often you'd list specific ones + 'All' overarching

  const filteredEvents = events.filter(event => {
    if (selectedCategory === 'All') {
      return true; // Show all events
    }
    // Check if any of the event's target audiences match the selected category
    return event.targetAudience.includes(selectedCategory.toLowerCase());
  });


  const eventsToShow = filteredEvents.slice(0, displayedEventsCount);
  const hasMoreEvents = displayedEventsCount < filteredEvents.length;

  const loadMore = () => {
    setDisplayedEventsCount(prevCount => prevCount + eventsPerPage);
  };

  // Variants for section animations
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut, when: "beforeChildren" }
    },
  };

  // Variants for individual event cards
  const eventCardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: easeOut }
    },
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 min-h-screen pb-20">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c7d2fe\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 34v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zM36 10v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 10v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="bg-blue-900 text-white rounded-3xl shadow-xl overflow-hidden mb-20 p-8 md:p-16 text-center relative"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${calendarHero})`, opacity: 0.2 }}></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Studyhabit College Event Calendar 📅
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
              Never miss an important date! Here's a comprehensive overview of all academic, cultural, sports, and community events at Studyhabit College.
            </p>
            <Link
              to="/admissions"
              className="inline-block px-8 py-3 bg-yellow-500 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 transform"
            >
              Learn More About Us
            </Link>
          </div>
        </motion.div>

        {/* --- */}

        {/* Event Categories Filter */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-12 text-center"
        >
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Filter Events by Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setDisplayedEventsCount(eventsPerPage); // Reset displayed count on category change
                }}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {category === 'all' ? 'All Stakeholders' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </motion.section>

        {/* --- */}

        {/* Events List */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-indigo-500"
        >
          {loading && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-lg font-medium text-gray-700">Loading events... ⏳</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-10 px-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl shadow-md">
              <p className="text-xl font-bold mb-3 flex items-center justify-center">
                <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i> Error Loading Events!
              </p>
              <p className="text-md mb-4">{error}</p>
              <button
                onClick={fetchEvents}
                className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
              >
                <i className="fas fa-redo-alt mr-2"></i> Retry
              </button>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-10 px-6 bg-blue-50 rounded-xl shadow-inner border-2 border-blue-200"
            >
              <p className="text-xl font-bold text-blue-700 mb-4 flex items-center justify-center">
                <i className="fas fa-calendar-times mr-3 text-blue-500"></i> No Events Scheduled Yet!
              </p>
              <p className="text-md text-gray-700 leading-relaxed">
                Check back soon for exciting updates and activities.
              </p>
            </motion.div>
          )}

          {!loading && !error && filteredEvents.length === 0 && events.length > 0 && (
            <div className="text-center py-10 px-6 bg-yellow-50 rounded-xl shadow-inner border-2 border-yellow-200">
              <p className="text-xl font-bold text-yellow-700 mb-4 flex items-center justify-center">
                <i className="fas fa-info-circle mr-3 text-yellow-500"></i> No Events in this Category
              </p>
              <p className="text-md text-gray-700 leading-relaxed">
                Try selecting a different category or "All" to see more events.
              </p>
            </div>
          )}


          {!loading && !error && filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {eventsToShow.map((event, index) => (
                  <motion.div
                    key={event._id} // Use event._id for unique key from backend
                    variants={eventCardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.05 }} // Staggered animation for events
                    className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                  >
                    {/* If your backend events include an imageUrl, display it here */}
                    {/* {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                    )} */}
                    <h3 className="text-xl font-bold text-blue-900 mb-2 leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      <i className="far fa-calendar-alt mr-2"></i>
                      <span className="font-semibold">{formatDateForDisplay(event.startDate)}</span>
                      {new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() &&
                        ` - ${formatDateForDisplay(event.endDate)}` // Show end date if different
                      }
                    </p>
                    {/* Assuming you don't store time specifically yet, just note "All Day" or time from start date */}
                    <p className="text-gray-600 text-sm mb-1">
                      <i className="far fa-clock mr-2"></i>
                      {/* You can refine this if your backend provides specific event times */}
                      {new Date(event.startDate).toDateString() === new Date(event.endDate).toDateString() ?
                       `Starts ${formatTimeForDisplay(event.startDate)}` : 'Multiple Days'
                      }
                    </p>
                    <p className="text-gray-600 text-sm mb-3">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      {event.location || 'Location to be announced'}
                    </p>
                    <p className="text-gray-700 text-base flex-grow mb-4">
                      {event.description || 'No description provided.'}
                    </p>
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {event.targetAudience.map(audience => (
                          <span key={audience} className="inline-block bg-indigo-200 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                            {audience.charAt(0).toUpperCase() + audience.slice(1)}
                          </span>
                        ))}
                      </div>
                      {/* You can add a link if your events have more detailed pages */}
                      {/* {event.link && (
                        <Link
                          to={event.link}
                          className="inline-block ml-4 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Details <i className="fas fa-external-link-alt ml-1 text-xs"></i>
                        </Link>
                      )} */}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {hasMoreEvents && (
            <div className="text-center mt-12">
              <motion.button
                onClick={loadMore}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="px-8 py-3 bg-blue-800 text-white font-semibold rounded-full hover:bg-blue-900 transition-colors duration-300 shadow-lg"
              >
                Load More Events <i className="fas fa-chevron-down ml-2"></i>
              </motion.button>
            </div>
          )}
        </motion.section>

        {/* --- */}

        {/* Calendar Integration (Placeholder/Future Idea) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-purple-50 p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-purple-500 text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 relative">
            Sync with Your Personal Calendar 🗓️
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-purple-500 rounded-full"></span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Want to add these events to your personal calendar? Soon, you'll be able to easily subscribe to our official school calendar feed to keep all important dates organized. Stay tuned for this feature!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-full cursor-not-allowed opacity-75">
              <i className="far fa-calendar-plus mr-2"></i> Add to Google Calendar (Coming Soon)
            </button>
            <button className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-full cursor-not-allowed opacity-75">
              <i className="fab fa-apple mr-2"></i> Add to Apple Calendar (Coming Soon)
            </button>
          </div>
        </motion.section>

        {/* --- */}

        {/* Call to Action */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-blue-800 text-white p-12 rounded-3xl shadow-2xl text-center"
        >
          <h2 className="text-4xl font-extrabold mb-6">
            Have an Idea for an Event?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Students, parents, and faculty are encouraged to contribute to our vibrant school life! Let us know your ideas.
          </p>
          <Link
            to="/contact"
            className="inline-block px-10 py-4 bg-yellow-400 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 transform"
          >
            Submit Your Event Idea! 💡
          </Link>
        </motion.section>
      </div>
    </div>
  );
};

export default EventsCalendarPage;