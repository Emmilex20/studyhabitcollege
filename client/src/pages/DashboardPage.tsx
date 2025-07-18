// src/pages/DashboardPage.tsx
import React from 'react';
import { motion, AnimatePresence, easeOut, type Variants } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // Assuming you have an AuthContext
import { Link, Outlet, useLocation } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { userInfo, logout } = useAuth(); // Destructure logout from useAuth
  const location = useLocation(); // To highlight active sidebar link

  // If user info isn't available, show a loading/not authenticated message
  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="text-center text-2xl font-semibold text-gray-700 bg-white p-10 rounded-xl shadow-2xl animate-pulse flex items-center space-x-3"
        >
          <i className="fas fa-spinner fa-spin text-blue-500 text-3xl"></i>
          <span>Loading user information or not authenticated...</span>
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
  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: easeOut } }
  };

  // NEW & IMPROVED Sidebar Animation Variants
  const sidebarVariants: Variants = {
    hidden: {
      x: '-100%',
      opacity: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 } as const
    },
    visible: {
      x: '0%',
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        delayChildren: 0.2,
        staggerChildren: 0.05
      } as const
    }
  };

  const sidebarItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="w-full md:w-72 lg:w-80 bg-gradient-to-b from-blue-900 to-indigo-950 text-white shadow-2xl p-6 md:p-8 md:sticky md:top-0 md:h-screen flex flex-col z-20 transform transition-all duration-300 ease-in-out"
      >
        <h2 className="text-3xl lg:text-4xl font-extrabold mb-8 mt-4 border-b border-blue-700 pb-5 text-blue-100 tracking-wide">
          <i className="fas fa-graduation-cap mr-3 text-yellow-400"></i>
          <span className="relative inline-block">
            {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)} Hub
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-pulse-fade"></span>
          </span>
        </h2>
        <nav className="flex-grow overflow-y-auto custom-scrollbar pr-2">
          <ul>
            {sidebarLinks.map((link) => (
              <motion.li
                key={link.name}
                variants={sidebarItemVariants}
                className="mb-3"
                whileHover={{ scale: 1.03, x: 8, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={link.path}
                  className={`flex items-center p-4 rounded-xl transition-all duration-300 text-lg group relative overflow-hidden
                    ${
                      location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path))
                        ? 'bg-blue-700 font-semibold text-yellow-300 shadow-lg transform translate-x-1 border-l-4 border-yellow-400'
                        : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                    }`}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <i className={`${link.icon} mr-4 text-xl z-10
                    ${
                      location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path))
                        ? 'text-yellow-400'
                        : 'text-blue-300 group-hover:text-yellow-300'
                    }`}></i>
                  <span className="z-10">{link.name}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        {/* User Info in Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-auto pt-7 border-t border-blue-700 text-blue-200 text-center md:text-left"
        >
          <p className="text-sm text-blue-300 mb-1">Logged in as:</p>
          <p className="font-bold text-2xl mb-1 text-white truncate">{userInfo.firstName} {userInfo.lastName}</p>
          <p className="text-xs text-blue-400 italic truncate">{userInfo.email}</p>
          <button
            onClick={logout} 
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md"
          >
            Logout <i className="fas fa-sign-out-alt ml-2"></i>
          </button>
        </motion.div>
      </motion.aside>

      {/* Main Content Area - This is where sub-routes will render */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 flex flex-col overflow-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-8 md:mb-10 text-center md:text-left leading-tight">
          Welcome, <span className="text-indigo-600">{userInfo.firstName}</span>! 👋
          <span className="block w-24 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mt-3 mx-auto md:mx-0 shadow-lg"></span>
        </h1>
        <AnimatePresence mode='wait'>
          <motion.div
            key={location.pathname} // Key change forces re-render and animation on route change
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white p-8 lg:p-12 rounded-3xl shadow-2xl border border-gray-200 flex-grow relative overflow-hidden"
          >
            {/* Background elements for visual interest */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
              <i className="fas fa-lightbulb absolute -top-10 -left-10 text-9xl text-yellow-200 transform rotate-45"></i>
              <i className="fas fa-cogs absolute -bottom-10 -right-10 text-9xl text-blue-200 transform -rotate-45"></i>
            </div>
            <Outlet /> {/* This is where the nested route components will render */}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardPage;