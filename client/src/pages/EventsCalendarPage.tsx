// src/pages/EventsCalendarPage.tsx
import React, { useState } from 'react';
import { motion, easeOut } from 'framer-motion';
import { Link } from 'react-router-dom';

// Placeholder for an Events Calendar hero image
import calendarHero from '../assets/calendar-hero.png'; // e.g., a diverse group of students at an event

// Define the type for an event item (expanded from NewsEventsPage)
interface EventItem {
  id: number;
  title: string;
  date: string; // Could be a single date or a range "July 15-17, 2025"
  time: string;
  location: string;
  description: string;
  category: 'Academic' | 'Sports' | 'Cultural' | 'Community' | 'General';
  imageUrl?: string; // Optional image for larger event cards
  link?: string; // Optional link for more details about a specific event
}

// Sample Full Events Data (more extensive)
const allEvents: EventItem[] = [
  {
    id: 1,
    title: "New Student Orientation",
    date: "August 20, 2025",
    time: "9:00 AM - 3:00 PM",
    location: "College Main Hall",
    description: "A comprehensive welcoming event for all new students and their parents. Meet faculty, explore facilities, and learn about college life.",
    category: 'General',
    imageUrl: "https://images.pexels.com/photos/3769747/pexels-photo-3769747.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: 2,
    title: "Resumption for New Academic Session (All Students)",
    date: "September 08, 2025",
    time: "All Day",
    location: "Studyhabit College Campus",
    description: "The official commencement of the new academic year for all returning and new students.",
    category: 'Academic',
    imageUrl: "https://images.pexels.com/photos/4145347/pexels-photo-4145347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: 3,
    title: "Annual Inter-House Debate Competition Finals",
    date: "October 15, 2025",
    time: "10:00 AM - 1:00 PM",
    location: "College Auditorium",
    description: "Witness captivating arguments and intellectual prowess as our houses battle for the prestigious debate championship title.",
    category: 'Academic',
    imageUrl: "https://images.pexels.com/photos/8199580/pexels-photo-8199580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: 4,
    title: "Cultural Day Celebration",
    date: "October 25, 2025",
    time: "11:00 AM - 4:00 PM",
    location: "College Sports Field",
    description: "A vibrant showcase of Nigeria's rich cultural diversity through traditional music, dance, fashion, and cuisine.",
    category: 'Cultural',
    imageUrl: "https://images.pexels.com/photos/16147424/pexels-photo-16147424/free-photo-of-man-in-traditional-costume-dancing.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: 5,
    title: "Mid-Term Break",
    date: "November 01 - 07, 2025",
    time: "All Day",
    location: "Off-Campus",
    description: "A period for students to rest and rejuvenate before the final stretch of the term.",
    category: 'General'
  },
  {
    id: 6,
    title: "Annual Sports Festival",
    date: "November 20-22, 2025",
    time: "9:00 AM - 5:00 PM daily",
    location: "College Sports Complex",
    description: "Three days of exhilarating sporting events, showcasing student athletic talent and sportsmanship across various disciplines.",
    category: 'Sports',
    imageUrl: "https://images.pexels.com/photos/17260537/pexels-photo-17260537/free-photo-of-man-in-white-t-shirt-and-black-shorts-running-on-track.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: 7,
    title: "End of Term Examinations",
    date: "December 01 - 12, 2025",
    time: "Scheduled Times",
    location: "College Examination Halls",
    description: "Comprehensive examinations covering all subjects taught during the term.",
    category: 'Academic'
  },
  {
    id: 8,
    title: "Christmas Carol Service",
    date: "December 15, 2025",
    time: "6:00 PM - 8:00 PM",
    location: "College Auditorium",
    description: "A joyous celebration featuring choir performances, readings, and festive cheer.",
    category: 'Cultural'
  },
  {
    id: 9,
    title: "Christmas / New Year Break",
    date: "December 16, 2025 - January 05, 2026",
    time: "All Day",
    location: "Off-Campus",
    description: "Extended holiday period for students to spend time with family.",
    category: 'General'
  },
  {
    id: 10,
    title: "Parent-Teacher Conference (First Term)",
    date: "January 10, 2026",
    time: "9:00 AM - 4:00 PM",
    location: "College Classrooms",
    description: "Opportunity for parents to discuss student progress with teachers.",
    category: 'Community'
  },
  {
    id: 11,
    title: "Excursion: Visit to Lekki Conservation Centre",
    date: "January 25, 2026",
    time: "8:00 AM - 5:00 PM",
    location: "Lekki Conservation Centre",
    description: "An educational outing for students to experience nature and learn about conservation efforts.",
    category: 'General',
    imageUrl: "https://images.pexels.com/photos/3471441/pexels-photo-3471441.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: 12,
    title: "School Play: 'The Lion and the Jewel'",
    date: "February 14-15, 2026",
    time: "7:00 PM - 9:00 PM",
    location: "College Auditorium",
    description: "Our drama club presents a captivating performance of Wole Soyinka's classic play.",
    category: 'Cultural',
    imageUrl: "https://images.pexels.com/photos/15668677/pexels-photo-15668677/free-photo-of-people-playing-on-stage.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
];


const EventsCalendarPage: React.FC = () => {
  const eventsPerPage = 6; // Number of events to show initially
  const [displayedEventsCount, setDisplayedEventsCount] = useState(eventsPerPage);
  const [selectedCategory, setSelectedCategory] = useState<EventItem['category'] | 'All'>('All');

  const filteredEvents = allEvents.filter(event =>
    selectedCategory === 'All' || event.category === selectedCategory
  );

  const eventsToShow = filteredEvents.slice(0, displayedEventsCount);
  const hasMoreEvents = displayedEventsCount < filteredEvents.length;

  const loadMore = () => {
    setDisplayedEventsCount(prevCount => prevCount + eventsPerPage);
  };

  const categories = ['All', ...Array.from(new Set(allEvents.map(event => event.category)))];

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
                  setSelectedCategory(category as EventItem['category'] | 'All');
                  setDisplayedEventsCount(eventsPerPage); // Reset displayed count on category change
                }}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {category}
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
          {filteredEvents.length === 0 ? (
            <p className="text-center text-xl text-gray-600">No events found for this category.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventsToShow.map((event, index) => (
                <motion.div
                  key={event.id}
                  variants={eventCardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.05 }} // Staggered animation for events
                  className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                >
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-40 object-cover rounded-md mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold text-blue-900 mb-2 leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">
                    <i className="far fa-calendar-alt mr-2"></i>
                    <span className="font-semibold">{event.date}</span>
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <i className="far fa-clock mr-2"></i>
                    <span className="font-semibold">{event.time}</span>
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    {event.location}
                  </p>
                  <p className="text-gray-700 text-base flex-grow mb-4">
                    {event.description}
                  </p>
                  <div className="mt-auto">
                    <span className="inline-block bg-indigo-200 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {event.category}
                    </span>
                    {event.link && (
                      <Link
                        to={event.link}
                        className="inline-block ml-4 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                      >
                        Details <i className="fas fa-external-link-alt ml-1 text-xs"></i>
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
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