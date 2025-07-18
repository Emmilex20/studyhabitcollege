// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, easeOut, type Variants, type Transition } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { userInfo, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open on larger screens
  const [isMobile, setIsMobile] = useState(false); // State to detect mobile view

  // Effect to determine if we are on a mobile device and adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      // Tailwind's 'md' breakpoint is 768px.
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      // On desktop, sidebar should be open by default. On mobile, it should be closed initially.
      setIsSidebarOpen(!mobileView);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount to set initial state

    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change when in mobile view
  useEffect(() => {
    // Only auto-close if it's mobile view AND the sidebar is currently open
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isSidebarOpen]);

  // --- Initial Loading / Authentication Checks ---
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="text-center text-xl text-gray-600 bg-white p-8 rounded-lg shadow-md animate-pulse">
          <i className="fas fa-spinner fa-spin text-4xl mb-4 text-indigo-600"></i>
          <p>Loading user information... Please wait.</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-lg shadow-lg"
        >
          <i className="fas fa-exclamation-triangle text-orange-500 text-4xl mb-4"></i>
          <p className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</p>
          <p className="text-gray-500">Please log in to access the dashboard.</p>
        </motion.div>
      </div>
    );
  }

  // --- Sidebar Links Definition (based on user role) ---
  const getSidebarLinks = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' },
          { name: 'Users', path: '/dashboard/users', icon: 'fas fa-users' },
          { name: 'Courses', path: '/dashboard/courses', icon: 'fas fa-book-open' },
          { name: 'Students', path: '/dashboard/students', icon: 'fas fa-user-graduate' },
          { name: 'Grades', path: '/dashboard/grades', icon: 'fas fa-chart-line' },
          { name: 'Attendance', path: '/dashboard/attendance', icon: 'fas fa-user-check' },
          { name: 'Events', path: '/dashboard/events', icon: 'fas fa-calendar-alt' },
          { name: 'Gallery', path: '/dashboard/gallery', icon: 'fas fa-images' },
          { name: 'Announcements', path: '/dashboard/announcements', icon: 'fas fa-bullhorn' },
          { name: 'Settings', path: '/dashboard/settings', icon: 'fas fa-cog' },
        ];
      case 'teacher':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' },
          { name: 'My Courses', path: '/dashboard/teacher-courses', icon: 'fas fa-book' },
          { name: 'My Students', path: '/dashboard/teacher-students', icon: 'fas fa-user-graduate' },
          { name: 'Gradebook', path: '/dashboard/teacher-gradebook', icon: 'fas fa-clipboard-list' },
          { name: 'Record Attendance', path: '/dashboard/teacher-attendance', icon: 'fas fa-user-check' },
          { name: 'Events', path: '/dashboard/events', icon: 'fas fa-calendar-alt' },
          { name: 'Announcements', path: '/dashboard/announcements', icon: 'fas fa-bullhorn' },
          { name: 'Settings', path: '/dashboard/settings', icon: 'fas fa-cog' },
        ];
      case 'student':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' },
          { name: 'My Courses', path: '/dashboard/student-course', icon: 'fas fa-book' },
          { name: 'My Grades', path: '/dashboard/student-grades', icon: 'fas fa-award' },
          { name: 'Attendance', path: '/dashboard/student-attendance', icon: 'fas fa-user-check' },
          { name: 'Announcements', path: '/dashboard/announcements', icon: 'fas fa-bullhorn' },
          { name: 'Events', path: '/dashboard/events', icon: 'fas fa-calendar-alt' },
          { name: 'Settings', path: '/dashboard/settings', icon: 'fas fa-cog' },
        ];
      case 'parent':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' },
          { name: 'My Children', path: '/dashboard/child', icon: 'fas fa-child' },
          { name: 'Announcements', path: '/dashboard/announcements', icon: 'fas fa-bullhorn' },
          { name: 'Events', path: '/dashboard/events', icon: 'fas fa-calendar-alt' },
          { name: 'Settings', path: '/dashboard/settings', icon: 'fas fa-cog' },
        ];
      default:
        return [{ name: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' }];
    }
  };

  const sidebarLinks = getSidebarLinks(userInfo.role);

  // --- Framer Motion Variants ---
  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: easeOut } },
  };

  const sidebarVariants: Variants = {
    open: (isMobile: boolean) => ({
      x: 0,
      width: isMobile ? '75vw' : '18rem', // 75vw on mobile, 18rem (288px) on desktop
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 30,
        when: 'beforeChildren', // Orchestrates child animations
      } as Transition, // Explicitly cast to Transition
    }),
    closed: (isMobile: boolean) => ({
      x: isMobile ? '-100%' : 0, // Slide off-screen on mobile, collapse on desktop
      width: isMobile ? 0 : '4rem', // Hide on mobile, collapse to icon-only on desktop
      opacity: isMobile ? 0 : 1, // Hide opacity on mobile when sliding off
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 30,
        when: 'afterChildren', // Orchestrates child animations
      } as Transition, // Explicitly cast to Transition
    }),
  };

  const overlayVariants: Variants = {
    visible: { opacity: 0.5, pointerEvents: 'auto' },
    hidden: { opacity: 0, pointerEvents: 'none' },
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      {/* Mobile Sidebar Overlay (visible only when sidebar is open on mobile) */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            className="fixed inset-0 bg-black z-40"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isSidebarOpen ? 'open' : 'closed'}
        custom={isMobile}
        variants={sidebarVariants}
        className={`relative z-50 flex-shrink-0 bg-indigo-800 text-white shadow-2xl overflow-hidden
                    ${isMobile ? 'fixed h-full' : 'h-screen'}`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo/Title & Toggle Button */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-indigo-700">
            <motion.h2
              className="text-2xl font-extrabold text-indigo-100 whitespace-nowrap"
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              transition={{ delay: 0.1 }}
            >
              <i className="fas fa-graduation-cap mr-3 text-yellow-400"></i>
              StudyHub
            </motion.h2>
            {/* Toggle Button for Sidebar - ALWAYS VISIBLE IN SIDEBAR */}
            <button
              onClick={toggleSidebar}
              className="text-white text-2xl focus:outline-none p-2 rounded-md hover:bg-indigo-700 transition-colors"
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <i className={isSidebarOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow overflow-y-auto custom-scrollbar pr-2">
            <ul>
              {sidebarLinks.map((link) => (
                <motion.li
                  key={link.name}
                  className="mb-2"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center p-3 rounded-lg transition-all duration-300 text-lg
                                ${
                                  location.pathname === link.path ||
                                  (link.path !== '/dashboard' &&
                                    location.pathname.startsWith(link.path))
                                    ? 'bg-indigo-700 font-semibold text-yellow-300 shadow-inner'
                                    : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                                }`}
                    onClick={() => {
                      if (isMobile) setIsSidebarOpen(false); // Close sidebar on link click for mobile
                    }}
                  >
                    <i
                      className={`${link.icon} ${isSidebarOpen ? 'mr-4' : 'mr-0'} text-xl ${
                        location.pathname === link.path ||
                        (link.path !== '/dashboard' &&
                          location.pathname.startsWith(link.path))
                          ? 'text-yellow-400'
                          : 'text-indigo-300'
                      }`}
                    ></i>
                    <motion.span
                      className="whitespace-nowrap"
                      animate={{ opacity: isSidebarOpen ? 1 : 0 }}
                      transition={{ delay: isSidebarOpen ? 0.1 : 0 }}
                      style={{ display: isSidebarOpen ? 'inline-block' : 'none' }}
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* User Info in Sidebar */}
          <div className="mt-auto pt-6 border-t border-indigo-700 text-indigo-200">
            <motion.div
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              transition={{ delay: isSidebarOpen ? 0.1 : 0 }}
              style={{ display: isSidebarOpen ? 'block' : 'none' }}
            >
              <p className="text-sm">Logged in as:</p>
              <p className="font-bold text-xl mb-1 text-white">
                {userInfo.firstName} {userInfo.lastName}
              </p>
              <p className="text-xs text-indigo-300 truncate">{userInfo.email}</p>
            </motion.div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 flex flex-col bg-gray-50">
        <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-900 mb-6 md:mb-8 text-center md:text-left">
          Welcome, {userInfo.firstName}!
          <span className="block w-20 h-1.5 bg-yellow-500 rounded-full mt-2 mx-auto md:mx-0"></span>
        </h1>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-200 flex-grow overflow-x-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Custom Scrollbar Styles - IMPORTANT: Move this to your global CSS file (e.g., index.css or App.css) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #5A67D8; /* indigo-500 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8B5CF6; /* purple-500 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7C3AED; /* purple-600 */
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;