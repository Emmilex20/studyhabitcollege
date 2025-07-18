/* eslint-disable no-irregular-whitespace */
// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, type NavLinkRenderProps } from 'react-router-dom';
import StudyhabitLogo from '../assets/studyhabitlogo.png';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, easeOut } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const [isNewsEventsDropdownOpen, setIsNewsEventsDropdownOpen] = useState(false); // State for News & Events dropdown
  const [isCampusResourcesDropdownOpen, setIsCampusResourcesDropdownOpen] = useState(false); // New state for Campus Resources dropdown

  // Refs for each dropdown to detect clicks outside
  const newsEventsDropdownRef = useRef<HTMLDivElement>(null);
  const campusResourcesDropdownRef = useRef<HTMLDivElement>(null);

  const { userInfo, logout } = useAuth();

  // --- Effect to manage body scroll lock ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // --- Effect to handle clicks outside dropdowns ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close News & Events dropdown if click is outside it
      if (newsEventsDropdownRef.current && !newsEventsDropdownRef.current.contains(event.target as Node)) {
        setIsNewsEventsDropdownOpen(false);
      }
      // Close Campus Resources dropdown if click is outside it
      if (campusResourcesDropdownRef.current && !campusResourcesDropdownRef.current.contains(event.target as Node)) {
        setIsCampusResourcesDropdownOpen(false);
      }
    };

    // Attach the event listener when dropdowns might be open
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up the event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const handleLogout = () => {
    logout();
    closeMobileMenu(); // Close mobile menu and dropdowns on logout
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
    setIsNewsEventsDropdownOpen(false); // Ensure dropdowns close when mobile menu closes
    setIsCampusResourcesDropdownOpen(false);
  };

  // Function to close all desktop dropdowns
  const closeAllDropdowns = () => {
    setIsNewsEventsDropdownOpen(false);
    setIsCampusResourcesDropdownOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Academics', path: '/academics' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const newsEventsDropdownLinks = [
    { name: 'Latest News', path: '/news' },
    { name: 'News Archive', path: '/news-archive' },
    { name: 'Events Calendar', path: '/events-calendar' },
    { name: 'Campus Life', path: '/campus-life' },
  ];

  // NEW: Campus Resources dropdown links
  const campusResourcesDropdownLinks = [
    { name: 'Faculty', path: '/faculty' },
    { name: 'Student Life', path: '/student-life' }, // Moved from main nav
    { name: 'Gallery', path: '/gallery' },
  ];

  const mobileMenuVariants = {
    hidden: {
      x: '100%',
      opacity: 0,
      transition: {
        when: "afterChildren",
        duration: 0.4,
        ease: easeOut
      }
    },
    visible: {
      x: '0%',
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.08,
        duration: 0.4,
        ease: easeOut
      }
    }
  };

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { ease: easeOut, duration: 0.3 } }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    transition: { duration: 0.3, ease: easeOut }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -20, pointerEvents: 'none' as const },
    visible: { opacity: 1, y: 0, pointerEvents: 'auto' as const, transition: { duration: 0.2, ease: easeOut } },
    exit: { opacity: 0, y: -20, pointerEvents: 'none' as const, transition: { duration: 0.2, ease: easeOut } }
  };

  return (
    <nav className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img src={StudyhabitLogo} alt="Studyhabit College Logo" className="h-10 sm:h-12 w-auto mr-2 md:mr-3 transform transition-transform duration-300 group-hover:scale-105" />
          <span className="text-xl sm:text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
            Studyhabit College
          </span>
        </Link>

        {/* Desktop/Tablet Navigation */}
        {/* Changed 'hidden md:flex' to 'hidden lg:flex' for larger desktop-first display */}
        {/* Added 'md:flex' to make it visible on tablets, but with adjusted spacing for tablet screens */}
        <div className="hidden md:flex flex-wrap justify-end items-center gap-x-4 lg:gap-x-8"> {/* Adjusted gap and added flex-wrap */}
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }: NavLinkRenderProps) =>
                `relative text-base lg:text-lg font-medium transition-colors duration-300 hover:text-yellow-400 group ${ // Adjusted text size
                  isActive ? 'text-yellow-400 font-semibold' : 'text-white'
                }`
              }
              onClick={closeAllDropdowns} // Close all dropdowns when navigating via main links
            >
              {({ isActive }: NavLinkRenderProps) => (
                <>
                  {link.name}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 transform transition-transform duration-300 group-hover:scale-x-100 ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}></span>
                </>
              )}
            </NavLink>
          ))}

          {/* News & Events Dropdown (Desktop/Tablet) */}
          <div className="relative" ref={newsEventsDropdownRef}>
            <button
              onClick={() => {
                setIsNewsEventsDropdownOpen(!isNewsEventsDropdownOpen);
                setIsCampusResourcesDropdownOpen(false); // Close other dropdown
              }}
              className={`relative text-base lg:text-lg font-medium transition-colors duration-300 hover:text-yellow-400 group flex items-center ${ // Adjusted text size
                isNewsEventsDropdownOpen ? 'text-yellow-400 font-semibold' : 'text-white'
              }`}
            >
              News & Events
              <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${isNewsEventsDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 transform transition-transform duration-300 group-hover:scale-x-100 ${
                isNewsEventsDropdownOpen ? 'scale-x-100' : 'scale-x-0'
              }`}></span>
            </button>
            <AnimatePresence>
              {isNewsEventsDropdownOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-1/2 -translate-x-1/2 mt-4 w-48 bg-blue-800 rounded-lg shadow-xl overflow-hidden py-2 z-10" // Increased z-index
                >
                  {newsEventsDropdownLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onClick={closeAllDropdowns} // Close all dropdowns on click of any link inside
                      className={({ isActive }: NavLinkRenderProps) =>
                        `block px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-700 hover:text-yellow-400 ${
                          isActive ? 'text-yellow-400 bg-blue-700 font-semibold' : 'text-white'
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NEW: Campus Resources Dropdown (Desktop/Tablet) */}
          <div className="relative" ref={campusResourcesDropdownRef}>
            <button
              onClick={() => {
                setIsCampusResourcesDropdownOpen(!isCampusResourcesDropdownOpen);
                setIsNewsEventsDropdownOpen(false); // Close other dropdown
              }}
              className={`relative text-base lg:text-lg font-medium transition-colors duration-300 hover:text-yellow-400 group flex items-center ${ // Adjusted text size
                isCampusResourcesDropdownOpen ? 'text-yellow-400 font-semibold' : 'text-white'
              }`}
            >
              Campus Resources
              <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${isCampusResourcesDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 transform transition-transform duration-300 group-hover:scale-x-100 ${
                isCampusResourcesDropdownOpen ? 'scale-x-100' : 'scale-x-0'
              }`}></span>
            </button>
            <AnimatePresence>
              {isCampusResourcesDropdownOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-1/2 -translate-x-1/2 mt-4 w-48 bg-blue-800 rounded-lg shadow-xl overflow-hidden py-2 z-10" // Increased z-index
                >
                  {campusResourcesDropdownLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onClick={closeAllDropdowns} // Close all dropdowns on click of any link inside
                      className={({ isActive }: NavLinkRenderProps) =>
                        `block px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-700 hover:text-yellow-400 ${
                          isActive ? 'text-yellow-400 bg-blue-700 font-semibold' : 'text-white'
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {userInfo ? (
            <>
              <Link
                to="/dashboard"
                className="ml-0 md:ml-4 px-4 py-2 text-sm md:px-5 md:py-2 md:text-base bg-green-500 text-blue-900 font-semibold rounded-full shadow-md hover:bg-green-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" // Adjusted margin and padding for tablet
                onClick={closeAllDropdowns}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm md:px-5 md:py-2 md:text-base bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" // Adjusted padding for tablet
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-0 md:ml-4 px-4 py-2 text-sm md:px-5 md:py-2 md:text-base bg-yellow-500 text-blue-900 font-semibold rounded-full shadow-md hover:bg-yellow-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" // Adjusted margin and padding for tablet
              onClick={closeAllDropdowns}
            >
              Login 👋
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center"> {/* Stays hidden on md and up */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none p-2 rounded-md hover:bg-blue-800 transition-colors duration-300"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.path
                    key="close"
                    initial={{ pathLength: 0, opacity: 0, rotate: -45 }}
                    animate={{ pathLength: 1, opacity: 1, rotate: 0 }}
                    exit={{ pathLength: 0, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2, ease: easeOut }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></motion.path>
                ) : (
                  <motion.path
                    key="open"
                    initial={{ pathLength: 0, opacity: 0, rotate: 45 }}
                    animate={{ pathLength: 1, opacity: 1, rotate: 0 }}
                    exit={{ pathLength: 0, opacity: 0, rotate: -45 }}
                    transition={{ duration: 0.2, ease: easeOut }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></motion.path>
                )}
              </AnimatePresence>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide-in from Right Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            />

            {/* Actual Side Menu */}
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="md:hidden fixed inset-y-0 right-0 h-full w-3/4 sm:w-2/3 max-w-xs bg-blue-900 shadow-2xl z-50 p-6 flex flex-col overflow-y-auto"
            >
              {/* Close Button within the menu */}
              <button
                onClick={closeMobileMenu}
                className="self-end text-white text-4xl p-2 rounded-full hover:bg-red-600 transition-colors duration-300 transform rotate-0 hover:rotate-90"
                aria-label="Close menu"
              >
                &times;
              </button>

              <nav className="flex flex-col items-start space-y-6 mt-8 flex-grow">
                {navLinks.map((link) => (
                  <motion.div variants={mobileMenuItemVariants} key={link.name} className="w-full">
                    <NavLink
                      to={link.path}
                      className={({ isActive }: NavLinkRenderProps) =>
                        `block px-4 py-3 text-xl font-semibold rounded-lg transition-all duration-300 transform hover:translate-x-2 hover:bg-blue-800 hover:text-yellow-400 ${
                          isActive ? 'text-yellow-400 bg-blue-800 shadow-inner' : 'text-white'
                        }`
                      }
                      onClick={closeMobileMenu}
                    >
                      {link.name}
                    </NavLink>
                  </motion.div>
                ))}

                {/* Mobile Dropdown for News & Events */}
                <motion.div variants={mobileMenuItemVariants} className="w-full">
                  <button
                    onClick={() => {
                      setIsNewsEventsDropdownOpen(!isNewsEventsDropdownOpen);
                      setIsCampusResourcesDropdownOpen(false); // Close other dropdown
                    }}
                    className="flex justify-between items-center w-full px-4 py-3 text-xl font-semibold rounded-lg transition-all duration-300 hover:translate-x-2 hover:bg-blue-800 hover:text-yellow-400 text-white"
                  >
                    News & Events
                    <svg className={`ml-1 w-6 h-6 transition-transform duration-200 ${isNewsEventsDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <AnimatePresence>
                    {isNewsEventsDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: easeOut }}
                        className="flex flex-col pl-6 mt-2 space-y-2"
                      >
                        {newsEventsDropdownLinks.map((link) => (
                          <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }: NavLinkRenderProps) =>
                              `block px-4 py-2 text-lg font-medium rounded-lg transition-all duration-300 hover:bg-blue-700 hover:text-yellow-400 ${
                                isActive ? 'text-yellow-400 bg-blue-700' : 'text-white'
                              }`
                            }
                            onClick={closeMobileMenu} // Closes mobile menu and thus dropdown
                          >
                            {link.name}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* NEW: Mobile Dropdown for Campus Resources */}
                <motion.div variants={mobileMenuItemVariants} className="w-full">
                  <button
                    onClick={() => {
                      setIsCampusResourcesDropdownOpen(!isCampusResourcesDropdownOpen);
                      setIsNewsEventsDropdownOpen(false); // Close other dropdown
                    }}
                    className="flex justify-between items-center w-full px-4 py-3 text-xl font-semibold rounded-lg transition-all duration-300 hover:translate-x-2 hover:bg-blue-800 hover:text-yellow-400 text-white"
                  >
                    Campus Resources
                    <svg className={`ml-1 w-6 h-6 transition-transform duration-200 ${isCampusResourcesDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <AnimatePresence>
                    {isCampusResourcesDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: easeOut }}
                        className="flex flex-col pl-6 mt-2 space-y-2"
                      >
                        {campusResourcesDropdownLinks.map((link) => (
                          <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }: NavLinkRenderProps) =>
                              `block px-4 py-2 text-lg font-medium rounded-lg transition-all duration-300 hover:bg-blue-700 hover:text-yellow-400 ${
                                isActive ? 'text-yellow-400 bg-blue-700' : 'text-white'
                              }`
                            }
                            onClick={closeMobileMenu} // Closes mobile menu and thus dropdown
                          >
                            {link.name}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </nav>

              {/* Login/Dashboard/Logout Buttons at the bottom */}
              <div className="flex flex-col items-center space-y-4 mt-auto py-4">
                {userInfo ? (
                  <>
                    <motion.div variants={mobileMenuItemVariants} className="w-full">
                      <Link
                        to="/dashboard"
                        className="block text-center px-6 py-3 bg-green-500 text-blue-900 font-semibold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={closeMobileMenu}
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                    <motion.div variants={mobileMenuItemVariants} className="w-full">
                      <button
                        onClick={handleLogout}
                        className="block text-center w-full px-6 py-3 bg-red-500 text-white font-semibold rounded-full shadow-lg hover:bg-red-600 transition-colors duration-300"
                      >
                        Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={mobileMenuItemVariants} className="w-full">
                    <Link
                      to="/login"
                      className="block text-center w-full px-6 py-3 bg-yellow-500 text-blue-900 font-semibold rounded-full shadow-lg hover:bg-yellow-600 transition-all duration-300 transform hover:-translate-y-1"
                      onClick={closeMobileMenu}
                    >
                      Login 👋
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;