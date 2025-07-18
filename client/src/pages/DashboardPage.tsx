// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { motion, AnimatePresence, easeOut } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { userInfo, loading: authLoading } = useAuth(); // Get loading state from auth context
  const location = useLocation(); // To highlight active sidebar link
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar toggle

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle initial loading and authentication state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="text-center text-xl text-gray-600 bg-white p-8 rounded-lg shadow-md animate-pulse">
          <i className="fas fa-spinner fa-spin text-4xl mb-4 text-blue-500"></i>
          <p>Loading user information...</p>
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
          <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
          <p className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</p>
          <p className="text-gray-500">Please log in to access the dashboard.</p>
        </motion.div>
      </div>
    );
  }

  // Define sidebar links based on user role
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

  // Animation variants for main content
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: easeOut } }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans antialiased">
      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)} // Close sidebar on overlay click
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false} // Disable initial animation on re-renders
        animate={{
          x: isSidebarOpen ? '0%' : '-100%',
          opacity: isSidebarOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: easeOut }}
        className={`fixed md:sticky top-0 left-0 h-screen w-64 lg:w-72 bg-blue-900 text-white shadow-2xl p-6 md:p-8 flex flex-col z-40
                    md:translate-x-0 md:opacity-100 transform`}
      >
        <h2 className="text-2xl lg:text-3xl font-extrabold mb-6 mt-2 border-b border-blue-700 pb-4 text-blue-100">
          <i className="fas fa-cubes mr-3 text-yellow-500"></i>
          {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)} Hub
        </h2>
        <nav className="flex-grow overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar */}
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
                    location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path))
                      ? 'bg-blue-700 font-semibold text-yellow-300 shadow-inner'
                      : 'text-blue-200'
                  }`}
                  onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click for mobile
                >
                  <i className={`${link.icon} mr-4 text-xl ${
                      location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path))
                        ? 'text-yellow-400'
                        : 'text-blue-300'
                    }`}></i>
                  {link.name}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        {/* User Info in Sidebar */}
        <div className="mt-auto pt-6 border-t border-blue-700 text-blue-200">
          <p className="text-sm">Logged in as:</p>
          <p className="font-bold text-xl mb-1 text-white">{userInfo.firstName} {userInfo.lastName}</p>
          <p className="text-xs text-blue-300 truncate">{userInfo.email}</p>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header/Hamburger Menu */}
        <header className="bg-white shadow-md p-4 flex items-center justify-between md:hidden z-10 sticky top-0">
          <h1 className="text-xl font-bold text-blue-900">
            {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)} Dashboard
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-blue-800 text-2xl focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <i className={isSidebarOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 flex flex-col">
          {/* Welcome Message - hidden on very small screens if sidebar is open, or visible generally */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-6 md:mb-8 text-center md:text-left">
            Welcome, {userInfo.lastName}!
            <span className="block w-20 h-1.5 bg-yellow-500 rounded-full mt-2 mx-auto md:mx-0"></span>
          </h1>
          <AnimatePresence mode='wait'>
            <motion.div
              key={location.pathname}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-200 flex-grow overflow-x-auto" // Added overflow-x-auto
            >
              <Outlet /> {/* This is where the nested route components will render */}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {/* Optional: Add a custom scrollbar style in your global CSS (e.g., index.css) */}
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