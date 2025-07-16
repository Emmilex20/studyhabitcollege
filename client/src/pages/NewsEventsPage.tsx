import React from 'react';
import { motion, easeOut } from 'framer-motion';
import { Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';

// Placeholder for a News & Events hero image
import newsEventsHero from '../assets/news-events-hero.jpg'; // e.g., students at an event, or a news headline image

// Sample News Data (more realistic and varied)
const currentNews = [
  {
    id: 1,
    title: "Inter-House Sports Fiesta Lights Up Studyhabit!",
    date: "July 12, 2025",
    excerpt: "Our annual inter-house sports competition concluded with unparalleled enthusiasm and spectacular displays of athleticism. Students from all four houses competed fiercely...",
    imageUrl: "https://images.pexels.com/photos/17260537/pexels-photo-17260537/free-photo-of-man-in-white-t-shirt-and-black-shorts-running-on-track.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Replace with actual image
    link: "/news/inter-house-sports-2025"
  },
  {
    id: 2,
    title: "Cambridge IGCSE Mock Results: A Testament to Excellence",
    date: "July 08, 2025",
    excerpt: "Studyhabit College celebrates the exceptional performance of our Year 10 students in the recent Cambridge IGCSE mock examinations. These results underscore our commitment to academic rigour...",
    imageUrl: "https://images.pexels.com/photos/4145353/pexels-photo-4145353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Replace with actual image
    link: "/news/igcse-mock-results-2025"
  },
  {
    id: 3,
    title: "Career Day 2025: Guiding Our Future Innovators",
    date: "June 30, 2025",
    excerpt: "Our annual Career Day brought together leading professionals from diverse industries to inspire and mentor students. Interactive sessions provided invaluable insights into various career paths...",
    imageUrl: "https://images.pexels.com/photos/3769726/pexels-photo-3769726.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Replace with actual image
    link: "/news/career-day-2025"
  },
  {
    id: 4,
    title: "Debate Club Clinches State Championship Title!",
    date: "June 20, 2025",
    excerpt: "Our formidable Debate Club has once again showcased their eloquence and critical thinking, securing the coveted State Championship title in a thrilling final round...",
    imageUrl: "https://images.pexels.com/photos/8199580/pexels-photo-8199580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Replace with actual image
    link: "/news/debate-championship-2025"
  },
  {
    id: 5,
    title: "Annual Literary Week Celebrates African Authors",
    date: "June 15, 2025",
    excerpt: "Studyhabit College celebrated its Annual Literary Week with a focus on African literature. Students engaged in book readings, poetry slams, and creative writing workshops...",
    imageUrl: "https://images.pexels.com/photos/3380183/pexels-photo-3380183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Replace with actual image
    link: "/news/literary-week-2025"
  },
  {
    id: 6,
    title: "Excursion to National Museum: A Journey Through History",
    date: "June 10, 2025",
    excerpt: "Our Year 8 students embarked on an enlightening excursion to the National Museum, gaining valuable insights into Nigerian history and cultural heritage...",
    imageUrl: "https://images.pexels.com/photos/2034969/pexels-photo-2034969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Replace with actual image
    link: "/news/museum-excursion-2025"
  }
];

// Sample Upcoming Events Data
const upcomingEvents = [
  {
    id: 1,
    title: "New Student Orientation",
    date: "August 20, 2025",
    time: "9:00 AM - 3:00 PM",
    location: "College Main Hall",
    description: "A welcoming event for all new students and their parents to get acquainted with Studyhabit College.",
    icon: "fas fa-user-friends"
  },
  {
    id: 2,
    title: "Resumption for New Academic Session",
    date: "September 08, 2025",
    time: "All Day",
    location: "Studyhabit College Campus",
    description: "All students return for the commencement of the new academic year.",
    icon: "fas fa-school"
  },
  {
    id: 3,
    title: "Annual Inter-House Debate Competition",
    date: "October 15, 2025",
    time: "10:00 AM",
    location: "College Auditorium",
    description: "Witness captivating arguments and intellectual prowess as our houses battle for the debate championship.",
    icon: "fas fa-comments"
  },
];


const NewsEventsPage: React.FC = () => {
  // Variants for section animations
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut, when: "beforeChildren" }
    },
  };

  // Variants for event items
  const eventItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOut } },
  };


  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen pb-20">
      {/* Background pattern (Optional, from previous pages) */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23a7e5f5\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 34v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zM36 10v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 10v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="bg-blue-900 text-white rounded-3xl shadow-xl overflow-hidden mb-20 p-8 md:p-16 text-center relative"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${newsEventsHero})`, opacity: 0.2 }}></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Stay Connected: News & Events at Studyhabit College 📣
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover the latest happenings, celebrate our achievements, and mark your calendars for upcoming events that shape our vibrant school community.
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 bg-yellow-500 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 transform"
            >
              Get In Touch
            </Link>
          </div>
        </motion.div>

        {/* --- */}

        {/* Latest News Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-blue-500"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-10 text-center relative">
            Latest News & Highlights ✨
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-blue-500 rounded-full"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentNews.slice(0, 3).map((newsItem, index) => ( // Show first 3 for 'latest'
              <NewsCard key={newsItem.id} news={newsItem} index={index} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/news-archive"> {/* Link to a dedicated archive page */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="px-8 py-3 bg-blue-800 text-white font-semibold rounded-full hover:bg-blue-900 transition-colors duration-300 shadow-lg"
              >
                View All News & Achievements <i className="fas fa-arrow-right ml-2"></i>
              </motion.button>
            </Link>
          </div>
        </motion.section>

        {/* --- */}

        {/* Upcoming Events Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-yellow-50 p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-yellow-500"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-10 text-center relative">
            Mark Your Calendars: Upcoming Events 🗓️
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-yellow-500 rounded-full"></span>
          </h2>

          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                variants={eventItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.15 }}
                className="flex flex-col md:flex-row items-start md:items-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex-shrink-0 text-center md:text-left mb-4 md:mb-0 md:mr-6">
                  <i className={`${event.icon} text-5xl text-yellow-600`}></i>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-blue-800 mb-1">{event.title}</h3>
                  <p className="text-gray-700 mb-2">
                    <i className="far fa-calendar-alt mr-2"></i>
                    <span className="font-semibold">{event.date}</span> at <span className="font-semibold">{event.time}</span>
                  </p>
                  <p className="text-gray-600 mb-2">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    {event.location}
                  </p>
                  <p className="text-gray-700 text-sm">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/events-calendar"> {/* This is the key part! */}
  <motion.button
    // ... animation and styling props
    className="px-8 py-3 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition-colors duration-300 shadow-lg"
  >
    View Full Events Calendar <i className="fas fa-calendar-check ml-2"></i>
  </motion.button>
</Link>
          </div>
        </motion.section>

        {/* --- */}

        {/* Call to Action: Newsletter Subscription */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-blue-800 text-white p-12 rounded-3xl shadow-2xl text-center"
        >
          <h2 className="text-4xl font-extrabold mb-6">
            Don't Miss a Beat! Subscribe to Our Newsletter 📧
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Get the latest news, event updates, and school announcements directly in your inbox.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-grow p-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Email for newsletter subscription"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-yellow-400 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 transform"
            >
              Subscribe Now!
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
};

export default NewsEventsPage;