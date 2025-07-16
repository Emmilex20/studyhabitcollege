// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, easeOut } from 'framer-motion'; // Make sure easeOut is imported here

const Footer: React.FC = () => {
  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut } // Use the imported easeOut
    }
  };

  // Animation variants for individual links/icons
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };


  return (
    <motion.footer
      className="bg-gradient-to-br from-blue-950 to-indigo-900 text-gray-200 py-12 mt-auto shadow-inner"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {/* About Section */}
        <motion.div variants={sectionVariants} className="flex flex-col items-start">
          <Link to="/" className="text-3xl font-extrabold mb-4 text-yellow-400 hover:text-yellow-300 transition-colors duration-300 transform hover:scale-105">
            Studyhabit College
          </Link>
          <p className="text-sm leading-relaxed mb-4">
            In pursuit of excellence. Providing quality education in Lagos, Nigeria, preparing students for global success. Our commitment is to foster a vibrant learning environment.
          </p>
          <div className="flex space-x-5 mt-auto"> {/* mt-auto pushes social icons to bottom if content above varies */}
            <motion.a
              href="https://facebook.com/studyhabit" // Replace with actual links
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-yellow-400 transition-transform transform hover:scale-125 duration-300"
              aria-label="Facebook"
              variants={itemVariants}
            >
              <i className="fab fa-facebook-f text-2xl"></i>
            </motion.a>
            <motion.a
              href="https://twitter.com/studyhabit" // Replace with actual links
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-yellow-400 transition-transform transform hover:scale-125 duration-300"
              aria-label="Twitter"
              variants={itemVariants}
            >
              <i className="fab fa-twitter text-2xl"></i>
            </motion.a>
            <motion.a
              href="https://instagram.com/studyhabit" // Replace with actual links
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-yellow-400 transition-transform transform hover:scale-125 duration-300"
              aria-label="Instagram"
              variants={itemVariants}
            >
              <i className="fab fa-instagram text-2xl"></i>
            </motion.a>
            <motion.a
              href="https://linkedin.com/company/studyhabit" // Add LinkedIn
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-yellow-400 transition-transform transform hover:scale-125 duration-300"
              aria-label="LinkedIn"
              variants={itemVariants}
            >
              <i className="fab fa-linkedin-in text-2xl"></i>
            </motion.a>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={sectionVariants}>
          <h3 className="text-2xl font-bold mb-5 text-yellow-400 border-b-2 border-yellow-500 pb-2 inline-block">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            {[
              { to: "/about", text: "About Us" },
              { to: "/academics", text: "Academics" },
              { to: "/admissions", text: "Admissions" },
              { to: "/news", text: "News & Events" },
              { to: "/contact", text: "Contact Us" },
              { to: "/privacy-policy", text: "Privacy Policy" }, // Added for completeness
              { to: "/terms-of-service", text: "Terms of Service" } // Added for completeness
            ].map((link, index) => (
              <motion.li key={index} variants={itemVariants}>
                <Link to={link.to} className="group flex items-center hover:text-yellow-400 transition-colors duration-300">
                  <i className="fas fa-chevron-right text-xs mr-3 text-yellow-500 group-hover:text-yellow-400 transition-all duration-200 group-hover:translate-x-1"></i>
                  {link.text}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Contact Information */}
        <motion.div variants={sectionVariants}>
          <h3 className="text-2xl font-bold mb-5 text-yellow-400 border-b-2 border-yellow-500 pb-2 inline-block">Get In Touch</h3>
          <ul className="space-y-4 text-sm">
            <motion.li variants={itemVariants} className="flex items-start">
              <i className="fas fa-map-marker-alt text-lg mr-3 text-yellow-500 flex-shrink-0 mt-1"></i>
              <address className="not-italic">Plot 217, Chief Owolabi Street, Agungi-Lekki, Lagos, Nigeria.</address>
            </motion.li>
            <motion.li variants={itemVariants} className="flex items-start">
              <i className="fas fa-phone text-lg mr-3 text-yellow-500 flex-shrink-0 mt-1"></i>
              <div>
                <a href="tel:+2348105469515" className="block hover:text-yellow-400 transition-colors">+234 810 546 9515</a>
                <a href="tel:+2348023172178" className="block hover:text-yellow-400 transition-colors">+234 802 317 2178</a>
              </div>
            </motion.li>
            <motion.li variants={itemVariants} className="flex items-start">
              <i className="fas fa-envelope text-lg mr-3 text-yellow-500 flex-shrink-0 mt-1"></i>
              <a href="mailto:info@studyhabit.com.ng" className="hover:text-yellow-400 transition-colors">info@studyhabit.com.ng</a>
            </motion.li>
          </ul>
        </motion.div>

        {/* Newsletter / Map Section (New) */}
        <motion.div variants={sectionVariants}>
          <h3 className="text-2xl font-bold mb-5 text-yellow-400 border-b-2 border-yellow-500 pb-2 inline-block">Stay Connected</h3>
          <p className="text-sm leading-relaxed mb-4">
            Subscribe to our newsletter for the latest updates and news from Studyhabit College.
          </p>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow p-3 rounded-md bg-blue-800 text-white border border-blue-700 focus:border-yellow-400 focus:ring focus:ring-yellow-400 focus:ring-opacity-50 outline-none placeholder-gray-400"
              aria-label="Email for newsletter subscription"
            />
            <button
              type="submit"
              className="bg-yellow-500 text-blue-950 font-bold py-3 px-6 rounded-md hover:bg-yellow-400 transition-colors duration-300 transform hover:scale-105 shadow-lg"
            >
              Subscribe
            </button>
          </form>
          {/* Optional: Embed a small map or add a map link */}
          <div className="mt-6 text-sm">
            <a
              href="https://www.google.com/maps/search/Plot+217,+Chief+Owolabi+Street,+Agungi-Lekki,+Lagos,+Nigeria." // Replace with actual map link
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-yellow-400 transition-colors flex items-center"
            >
              <i className="fas fa-map-marked-alt mr-2"></i> View on Map
            </a>
          </div>
        </motion.div>
      </div>

      {/* Copyright Section */}
      <div className="text-center text-sm mt-12 pt-6 border-t border-blue-800 border-opacity-70">
        <p>
          &copy; {new Date().getFullYear()} <span className="font-semibold">Studyhabit College, Lagos.</span> All rights reserved.
        </p>
        <p className="mt-1 text-gray-400">
          Crafted with passion for education 🎓
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;