// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, easeOut } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  // Destructure userInfo and the new loading state from AuthContext
  const { userInfo, loading: authLoading } = useAuth();
  const location = useLocation(); // To highlight the active sidebar link
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar toggle

  // Close the sidebar automatically when the route changes on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isSidebarOpen]); // Added isSidebarOpen to dependencies

  // --- Initial Loading / Authentication Checks ---
  // Show a general loading state if authentication data is still being fetched
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="text-center text-xl text-gray-600 bg-white p-8 rounded-lg shadow-md animate-pulse">
          <i className="fas fa-spinner fa-spin text-4xl mb-4 text-blue-500"></i>
          <p>Loading user information... Please wait.</p>
        </div>
      </div>
    );
  }

  // If loading is complete but no user information, display an authentication required message
  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-lg shadow-lg"
        >
          <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
          <p className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</p>
          <p className="text-gray-500">Please log in to access the dashboard functionalities.</p>
        </motion.div>
      </div>
    );
  }

  // --- Sidebar Links Definition (based on user role) ---
  const getSidebarLinks = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Overview', path: '/dashboard', icon: 'fas fa-tachometer-alt' },
          { name: 'Manage Users', path: '/dashboard/users', icon: 'fas fa-users' },
          { name: 'Manage Courses', path: '/dashboard/courses', icon: 'fas fa-book-open' },
          { name: 'Manage Students', path: '/dashboard/students', icon: 'fas fa-user-graduate' },
          { name: 'Manage Grades', path: '/dashboard/grades', icon: 'fas fa-chart-line' },
          { name: 'Manage Attendance', path: '/dashboard/attendance', icon: 'fas fa-user-check' },
          { name: 'Manage Events', path: '/dashboard/events', icon: 'fas fa-calendar-alt' },
          { name: 'Manage Gallery', path: '/dashboard/gallery', icon: 'fas fa-images' },
          { name: 'Announcements', path: '/dashboard/announcements', icon: 'fas fa-bullhorn' },
          { name: 'Settings', path: '/dashboard/settings', icon: 'fas fa-cog' },
        ];
      case 'teacher':
        return [
          { name: 'Overview', path: '/dashboard', icon: 'fas fa-tachometer-alt' },
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
          { name: 'Overview', path: '/dashboard', icon: 'fas fa-tachometer-alt' },
          { name: 'My Courses', path: '/dashboard/student-course', icon: 'fas fa-book' },
          { name: 'My Grades', path: '/dashboard/student-grades', icon: 'fas fa-award' },
          { name: 'Attendance', path: '/dashboard/student-attendance', icon: 'fas fa-user-check' },
          { name: 'Announcements', path: '/dashboard/announcements', icon: 'fas fa-bullhorn' },
          { name: 'Events', path: '/dashboard/events', icon: 'fas fa-calendar-alt' },
          { name: 'Settings', path: '/dashboard/settings', icon: 'fas fa-cog' },
        ];
      case 'parent':
        return [
          { name: 'Overview', path: '/dashboard', icon: 'fas fa-tachometer-alt' },
          { name: 'My Children', path: '/dashboard/child', icon: 'fas fa-child' },
          { name: 'Announcements', path: '/dashboard/announcements', icon: 'fas fa-bullhorn' },
          { name: 'Events', path: '/dashboard/events', icon: 'fas fa-calendar-alt' },
          { name: 'Settings', path: '/dashboard/settings', icon: 'fas fa-cog' },
        ];
      default:
        return [{ name: 'Overview', path: '/dashboard', icon: 'fas fa-tachometer-alt' }];
    }
  };

  const sidebarLinks = getSidebarLinks(userInfo.role);

  // --- Framer Motion Variants ---
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: easeOut } },
  };

  const sidebarVariants = {
    open: { x: '0%', opacity: 1, transition: { duration: 0.3, ease: easeOut } },
    closed: { x: '-100%', opacity: 0, transition: { duration: 0.3, ease: easeOut } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.7, transition: { duration: 0.3 } }, // Darker overlay for a professional look
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans antialiased">
      {/* Mobile Header (visible only on small screens) */}
      <header className="md:hidden sticky top-0 bg-white shadow-lg p-4 flex items-center justify-between z-50">
        <h1 className="text-xl font-bold text-blue-900">
          <i className="fas fa-cubes text-blue-600 mr-2"></i>
          {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)} Dashboard
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-blue-800 text-2xl focus:outline-none p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <i className={isSidebarOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </button>
      </header>

      {/* Main layout container for sidebar + content */}
      <div className="flex flex-col md:flex-row md:min-h-screen">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              className="fixed inset-0 bg-black z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={false} // Disable initial animation for re-renders on desktop
          animate={isSidebarOpen ? 'open' : 'closed'}
          variants={sidebarVariants}
          // Tailwind classes for responsiveness:
          // Fixed positioning & full height for mobile (when open)
          // `md:relative` to remove fixed positioning on md+ screens
          // `md:translate-x-0` & `md:opacity-100` to always show on md+ screens
          className={`fixed top-0 left-0 h-full w-64 lg:w-72 bg-blue-900 text-white shadow-2xl p-6 md:p-8 flex flex-col z-40
                      md:relative md:translate-x-0 md:opacity-100`}
        >
          <h2 className="text-2xl lg:text-3xl font-extrabold mb-6 mt-2 border-b border-blue-700 pb-4 text-blue-100">
            <i className="fas fa-cubes mr-3 text-yellow-500"></i>
            {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)} Hub
          </h2>
          <nav className="flex-grow overflow-y-auto custom-scrollbar pr-2">
            {' '}
            {/* Added pr-2 for scrollbar spacing */}
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
                    className={`flex items-center p-3 rounded-xl transition-all duration-300 text-lg hover:bg-blue-700 hover:shadow-md ${
                      location.pathname === link.path ||
                      (link.path !== '/dashboard' && location.pathname.startsWith(link.path))
                        ? 'bg-blue-700 font-semibold text-yellow-300 shadow-inner'
                        : 'text-blue-200'
                    }`}
                    onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click for mobile
                  >
                    <i
                      className={`${link.icon} mr-4 text-xl ${
                        location.pathname === link.path ||
                        (link.path !== '/dashboard' && location.pathname.startsWith(link.path))
                          ? 'text-yellow-400'
                          : 'text-blue-300'
                      }`}
                    ></i>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
          {/* User Info in Sidebar */}
          <div className="mt-auto pt-6 border-t border-blue-700 text-blue-200">
            <p className="text-sm">Logged in as:</p>
            <p className="font-bold text-xl mb-1 text-white">
              {userInfo.firstName} {userInfo.lastName}
            </p>
            <p className="text-xs text-blue-300 truncate">{userInfo.email}</p>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-6 md:mb-8 text-center md:text-left">
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
              <Outlet /> {/* This is where the nested route components will render */}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Custom Scrollbar Styles - **Consider moving to global CSS (e.g., index.css)** */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #3b82f6; /* blue-500 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #a78bfa; /* purple-400 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8b5cf6; /* purple-500 */
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;