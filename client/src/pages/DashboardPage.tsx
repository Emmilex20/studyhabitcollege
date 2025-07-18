// src/pages/DashboardPage.tsx
import React from 'react';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // Import AnimatePresence
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { userInfo } = useAuth();
  const location = useLocation(); // To highlight active sidebar link

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="text-center text-xl text-gray-600 bg-white p-8 rounded-lg shadow-md animate-pulse">
          Loading user information or not authenticated...
        </div>
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans antialiased">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '0%', opacity: 1 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="w-full md:w-64 lg:w-72 bg-blue-900 text-white shadow-2xl p-6 md:p-8 md:sticky md:top-0 md:h-screen flex flex-col z-20"
      >
        <h2 className="text-2xl lg:text-3xl font-extrabold mb-6 mt-2 border-b border-blue-700 pb-4 text-blue-100">
          <i className="fas fa-cubes mr-3 text-yellow-500"></i>
          {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)} Hub
        </h2>
        <nav className="flex-grow">
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

      {/* Main Content Area - This is where sub-routes will render */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-6 md:mb-8 text-center md:text-left">
          Welcome, {userInfo.firstName}!
          <span className="block w-20 h-1.5 bg-yellow-500 rounded-full mt-2 mx-auto md:mx-0"></span>
        </h1>
        <AnimatePresence mode='wait'>
          <motion.div
            key={location.pathname} // Key change forces re-render and animation on route change
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-200 flex-grow" // Added flex-grow
          >
            <Outlet /> {/* This is where the nested route components will render */}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardPage;