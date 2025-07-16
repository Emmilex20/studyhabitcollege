// src/pages/CampusLifePage.tsx
import React from 'react';
import { motion, easeOut, type Transition } from 'framer-motion'; // Import Transition type for assertion (optional but good practice)

// Import local images (you'll need to create or find these in src/assets)
import campusHero from '../assets/campus-life-hero.jpg';
import libraryImage from '../assets/library.jpg';
import labImage from '../assets/lab.jpg';
import sportsImage from '../assets/campus-sports.jpg';
import clubsImage from '../assets/campus-clubs.jpg';
import hostelImage from '../assets/campus-hostel.jpeg';
import medicalImage from '../assets/campus-medical.jpg';


const CampusLifePage: React.FC = () => {
  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut,
      },
    },
  };

  const featureCardVariants = {
    offscreen: {
      y: 100,
      opacity: 0
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as Transition["type"], // <-- CORRECTED HERE! Type assertion
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen pb-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut }}
        className="relative py-24 bg-blue-900 text-white text-center shadow-lg overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${campusHero})` }}
        ></div>
        <div className="relative z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">
            Vibrant Campus Life 🌟
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            Experience a holistic environment at Studyhabit College that nurtures growth, learning, and unforgettable memories.
          </p>
        </div>
      </motion.div>

      {/* Introduction Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="container mx-auto px-4 py-16 text-center"
      >
        <motion.h2 variants={itemVariants} className="text-4xl font-bold text-blue-800 mb-6">
          More Than Just Academics
        </motion.h2>
        <motion.p variants={itemVariants} className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
          At Studyhabit College, campus life is an integral part of your educational journey. We believe in fostering a dynamic community where students can pursue their passions, discover new interests, and build lifelong friendships. Our diverse range of facilities and activities ensures a balanced and enriching experience for everyone.
        </motion.p>
      </motion.section>

      {/* Key Aspects Sections */}

      {/* Academic & Learning Environment */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="container mx-auto px-4 py-16 bg-white rounded-xl shadow-2xl border-b-8 border-yellow-500 mb-16"
      >
        <h3 className="text-3xl md:text-4xl font-bold text-blue-800 mb-10 text-center relative">
          <i className="fas fa-book-open text-yellow-500 mr-3"></i> Academic & Learning Environment
          <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-yellow-500 rounded-full"></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <motion.div variants={featureCardVariants} className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <img src={libraryImage} alt="College Library" className="w-full h-48 object-cover rounded-md mb-4 shadow-sm" />
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Modern Library Facilities</h4>
            <p className="text-gray-700">Access a vast collection of resources, digital databases, and quiet study zones for focused learning.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <img src={labImage} alt="Science Lab" className="w-full h-48 object-cover rounded-md mb-4 shadow-sm" />
            <h4 className="font-semibold text-xl text-blue-900 mb-2">State-of-the-Art Laboratories</h4>
            <p className="text-gray-700">Hands-on experience with cutting-edge equipment in our well-equipped science and computer labs.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-chalkboard-teacher text-yellow-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Interactive Classrooms</h4>
            <p className="text-gray-700">Engaging learning spaces equipped with the latest audio-visual technology for dynamic lessons.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-laptop-code text-yellow-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Advanced ICT Center</h4>
            <p className="text-gray-700">High-speed internet and modern computers to support research and digital literacy.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-search text-yellow-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Dedicated Research Hubs</h4>
            <p className="text-gray-700">Spaces fostering innovation and knowledge creation with specialized equipment for advanced studies.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-user-graduate text-yellow-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Academic Support & Counseling</h4>
            <p className="text-gray-700">Guidance for course selection, mentorship, and career development to help you succeed.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Residential & Welfare Facilities */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="container mx-auto px-4 py-16 bg-white rounded-xl shadow-2xl border-b-8 border-green-500 mb-16"
      >
        <h3 className="text-3xl md:text-4xl font-bold text-blue-800 mb-10 text-center relative">
          <i className="fas fa-home text-green-500 mr-3"></i> Residential & Welfare Facilities
          <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-green-500 rounded-full"></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <motion.div variants={featureCardVariants} className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <img src={hostelImage} alt="Student Hostel" className="w-full h-48 object-cover rounded-md mb-4 shadow-sm" />
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Comfortable Hostels</h4>
            <p className="text-gray-700">Secure and homely on-campus accommodation with all essential amenities for a comfortable stay.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <img src={medicalImage} alt="Medical Centre" className="w-full h-48 object-cover rounded-md mb-4 shadow-sm" />
            <h4 className="font-semibold text-xl text-blue-900 mb-2">On-Campus Medical Centre</h4>
            <p className="text-gray-700">Access to professional healthcare services, emergency support, and wellness programs.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-utensils text-green-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Diverse Dining Options</h4>
            <p className="text-gray-700">Enjoy nutritious local and international cuisine at our modern cafeterias and dining halls.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-shield-alt text-green-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Enhanced Security</h4>
            <p className="text-gray-700">24/7 security personnel and advanced surveillance systems for your peace of mind.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-store text-green-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">On-Campus Shops</h4>
            <p className="text-gray-700">Convenience stores, bookstores, and essential services readily available.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-wifi text-green-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Seamless Connectivity</h4>
            <p className="text-gray-700">Reliable internet access throughout hostels and academic buildings.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Sports, Recreation & Social Engagement */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="container mx-auto px-4 py-16 bg-white rounded-xl shadow-2xl border-b-8 border-blue-500 mb-16"
      >
        <h3 className="text-3xl md:text-4xl font-bold text-blue-800 mb-10 text-center relative">
          <i className="fas fa-trophy text-blue-500 mr-3"></i> Sports, Recreation & Social Engagement
          <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-blue-500 rounded-full"></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <motion.div variants={featureCardVariants} className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <img src={sportsImage} alt="Sports Field" className="w-full h-48 object-cover rounded-md mb-4 shadow-sm" />
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Modern Sports Facilities</h4>
            <p className="text-gray-700">Football fields, basketball courts, and gyms for all your athletic pursuits.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <img src={clubsImage} alt="Student Clubs" className="w-full h-48 object-cover rounded-md mb-4 shadow-sm" />
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Diverse Student Clubs</h4>
            <p className="text-gray-700">Join academic, cultural, and recreational clubs to explore passions and build connections.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-theater-mask text-blue-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Vibrant Cultural Events</h4>
            <p className="text-gray-700">Celebrate diversity through festivals, talent shows, art exhibitions, and musical performances.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-users text-blue-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Active Student Government</h4>
            <p className="text-gray-700">Representing student interests and organizing campus-wide events for a vibrant community.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-puzzle-piece text-blue-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Recreational Spaces</h4>
            <p className="text-gray-700">Comfortable lounges and green areas to relax, socialize, and unwind after classes.</p>
          </motion.div>
          <motion.div variants={featureCardVariants} className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <i className="fas fa-lightbulb text-blue-600 text-5xl mb-4"></i>
            <h4 className="font-semibold text-xl text-blue-900 mb-2">Innovation & Entrepreneurship</h4>
            <p className="text-gray-700">Join workshops and initiatives that foster creative thinking and entrepreneurial spirit.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action for Campus Tour / Learn More */}
      <motion.section
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16 text-center bg-indigo-700 text-white rounded-xl shadow-2xl"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Experience Studyhabit Campus Life?
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
          We invite you to visit our campus and see for yourself what makes Studyhabit College a truly special place to learn and grow.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <motion.a
            href="/contact" // Link to your Contact Page
            whileHover={{ scale: 1.05, backgroundColor: '#c05621' }}
            whileTap={{ scale: 0.95 }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform"
          >
            Schedule a Campus Tour <i className="fas fa-arrow-right ml-2"></i>
          </motion.a>
          <motion.a
            href="/admissions" // Link to your Admissions Page
            whileHover={{ scale: 1.05, backgroundColor: '#3182ce' }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform"
          >
            Explore Admissions <i className="fas fa-external-link-alt ml-2"></i>
          </motion.a>
        </div>
      </motion.section>
    </div>
  );
};

export default CampusLifePage;