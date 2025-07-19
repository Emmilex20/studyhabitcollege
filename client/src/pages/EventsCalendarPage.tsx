import React, { useState, useEffect, useCallback } from 'react';
import { motion, easeOut, AnimatePresence, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Placeholder for an Events Calendar hero image
import calendarHero from '../assets/calendar-hero.png'; // e.g., a diverse group of students at an event

// Define the type for an event item as it comes from your backend
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
  imageUrl?: string; // Optional imageUrl field for event images
}

// Helper to format dates for display
const formatDateForDisplay = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper to format time (assuming events might have a more specific time if added to backend)
const formatTimeForDisplay = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const EventsCalendarPage: React.FC = () => {
  const eventsPerPage = 6;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedEventsCount, setDisplayedEventsCount] = useState(eventsPerPage);
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/events/public');
      const eventsData = Array.isArray(data) ? data : (data && Array.isArray(data.events) ? data.events : []);

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

  const allCategories = Array.from(new Set(events.flatMap(event => event.targetAudience)));
  const categories = ['All', ...allCategories.filter(cat => cat !== 'all')];

  const filteredEvents = events.filter(event => {
    if (selectedCategory === 'All') {
      return true;
    }
    return event.targetAudience.map(audience => audience.toLowerCase()).includes(selectedCategory.toLowerCase());
  });

  const eventsToShow = filteredEvents.slice(0, displayedEventsCount);
  const hasMoreEvents = displayedEventsCount < filteredEvents.length;

  const loadMore = () => {
    setDisplayedEventsCount(prevCount => prevCount + eventsPerPage);
  };

  const openModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling on body
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    document.body.style.overflow = ''; // Restore scrolling
  };

  // Variants for section animations
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut, when: "beforeChildren" }
    },
  };

  // Variants for individual event cards
  const eventCardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
        delay: 0.1
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)",
      transition: { type: "spring", stiffness: 300, damping: 10 }
    },
    tap: { scale: 0.98 }
  };

  // Variants for the modal
  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: -100 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      }
    },
    exit: { opacity: 0, scale: 0.8, y: 100, transition: { duration: 0.2 } }
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
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

        ---

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
              <motion.button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setDisplayedEventsCount(eventsPerPage); // Reset displayed count on category change
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg transform translate-y-[-2px]'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {category === 'all' ? 'All Stakeholders' : category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.section>

        ---

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
                    key={event._id}
                    variants={eventCardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.08 }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full overflow-hidden relative cursor-pointer" // Added cursor-pointer
                    onClick={() => openModal(event)} // Added onClick to open modal
                  >
                    {event.imageUrl && (
                      <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-blue-900 mb-2 leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1 flex items-center">
                      <i className="far fa-calendar-alt mr-2 text-indigo-500"></i>
                      <span className="font-semibold">{formatDateForDisplay(event.startDate)}</span>
                      {new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() &&
                        ` - ${formatDateForDisplay(event.endDate)}`
                      }
                    </p>
                    <p className="text-gray-600 text-sm mb-1 flex items-center">
                      <i className="far fa-clock mr-2 text-green-500"></i>
                      {new Date(event.startDate).toDateString() === new Date(event.endDate).toDateString() ?
                        `Starts ${formatTimeForDisplay(event.startDate)}` : 'Multiple Days'
                      }
                    </p>
                    <p className="text-gray-600 text-sm mb-3 flex items-center">
                      <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>
                      {event.location || 'Location to be announced'}
                    </p>
                    <p className="text-gray-700 text-base flex-grow mb-4 line-clamp-3"> {/* Use line-clamp to limit description length */}
                      {event.description || 'No description provided.'}
                    </p>
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {event.targetAudience.map(audience => (
                          <span key={audience} className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full border border-purple-300">
                            {audience.charAt(0).toUpperCase() + audience.slice(1)}
                          </span>
                        ))}
                      </div>
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
                className="px-8 py-3 bg-blue-800 text-white font-semibold rounded-full hover:bg-blue-900 transition-colors duration-300 shadow-lg flex items-center justify-center mx-auto group"
              >
                Load More Events
                <motion.i
                  className="fas fa-chevron-down ml-2 group-hover:translate-y-1 transition-transform duration-300"
                  animate={{ y: [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                ></motion.i>
              </motion.button>
            </div>
          )}
        </motion.section>

        ---

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

        ---

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

      {/* Event Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeModal} // Close modal when clicking on backdrop
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative m-auto border-t-8 border-indigo-600 transform"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
                aria-label="Close modal"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>

              {selectedEvent.imageUrl && (
                <div className="w-full h-64 overflow-hidden rounded-xl mb-6 shadow-md">
                  <img
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4 leading-tight">
                {selectedEvent.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-700 mb-6">
                <p className="flex items-center">
                  <i className="far fa-calendar-alt mr-3 text-indigo-600 text-xl"></i>
                  <span className="font-semibold">Date:</span> {formatDateForDisplay(selectedEvent.startDate)}
                  {new Date(selectedEvent.startDate).toDateString() !== new Date(selectedEvent.endDate).toDateString() &&
                    ` - ${formatDateForDisplay(selectedEvent.endDate)}`
                  }
                </p>
                <p className="flex items-center">
                  <i className="far fa-clock mr-3 text-green-600 text-xl"></i>
                  <span className="font-semibold">Time:</span>
                  {new Date(selectedEvent.startDate).toDateString() === new Date(selectedEvent.endDate).toDateString() ?
                    `${formatTimeForDisplay(selectedEvent.startDate)}` : 'Throughout the day(s)'
                  }
                </p>
                <p className="flex items-center col-span-1 md:col-span-2">
                  <i className="fas fa-map-marker-alt mr-3 text-red-600 text-xl"></i>
                  <span className="font-semibold">Location:</span> {selectedEvent.location || 'Location to be announced'}
                </p>
                <p className="flex items-center col-span-1 md:col-span-2">
                  <i className="fas fa-user-circle mr-3 text-yellow-600 text-xl"></i>
                  <span className="font-semibold">Organizer:</span> {selectedEvent.organizer.firstName} {selectedEvent.organizer.lastName}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-blue-800 mb-2 border-b border-gray-200 pb-1">Description:</h3>
                <p className="text-gray-800 leading-relaxed text-base">{selectedEvent.description || 'No detailed description available.'}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-blue-800 mb-2 border-b border-gray-200 pb-1">Target Audience:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.targetAudience.map(audience => (
                    <span key={audience} className="inline-block bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-1.5 rounded-full border border-indigo-300">
                      {audience.charAt(0).toUpperCase() + audience.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={closeModal}
                  className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors duration-300 shadow-md"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsCalendarPage;