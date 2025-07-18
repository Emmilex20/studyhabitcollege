// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { userInfo, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isSidebarOpen]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-lg text-gray-600 animate-pulse">
          <i className="fas fa-spinner fa-spin text-indigo-600 text-4xl mb-4" />
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
          className="text-center p-8 bg-white rounded-xl shadow-lg"
        >
          <i className="fas fa-lock text-red-500 text-4xl mb-4"></i>
          <p className="text-lg font-semibold">Access Denied</p>
          <p className="text-sm text-gray-500">Please log in to access the dashboard.</p>
        </motion.div>
      </div>
    );
  }

  const getSidebarLinks = (role: string) => {
    const commonLinks = [
      { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' },
      { name: 'Events', path: '/dashboard/events', icon: 'fas fa-calendar-alt' },
      { name: 'Announcements', path: '/dashboard/announcements', icon: 'fas fa-bullhorn' },
      { name: 'Settings', path: '/dashboard/settings', icon: 'fas fa-cog' },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roleLinks: Record<string, any[]> = {
      admin: [
        ...commonLinks,
        { name: 'Users', path: '/dashboard/users', icon: 'fas fa-users' },
        { name: 'Courses', path: '/dashboard/courses', icon: 'fas fa-book-open' },
        { name: 'Students', path: '/dashboard/students', icon: 'fas fa-user-graduate' },
        { name: 'Grades', path: '/dashboard/grades', icon: 'fas fa-chart-line' },
        { name: 'Attendance', path: '/dashboard/attendance', icon: 'fas fa-user-check' },
        { name: 'Gallery', path: '/dashboard/gallery', icon: 'fas fa-images' },
      ],
      teacher: [
        ...commonLinks,
        { name: 'My Courses', path: '/dashboard/teacher-courses', icon: 'fas fa-book' },
        { name: 'My Students', path: '/dashboard/teacher-students', icon: 'fas fa-user-graduate' },
        { name: 'Gradebook', path: '/dashboard/teacher-gradebook', icon: 'fas fa-clipboard-list' },
        { name: 'Record Attendance', path: '/dashboard/teacher-attendance', icon: 'fas fa-user-check' },
      ],
      student: [
        ...commonLinks,
        { name: 'My Courses', path: '/dashboard/student-course', icon: 'fas fa-book' },
        { name: 'My Grades', path: '/dashboard/student-grades', icon: 'fas fa-award' },
        { name: 'Attendance', path: '/dashboard/student-attendance', icon: 'fas fa-user-check' },
      ],
      parent: [
        ...commonLinks,
        { name: 'My Children', path: '/dashboard/child', icon: 'fas fa-child' },
      ],
    };
    return roleLinks[role] || commonLinks;
  };

  const sidebarLinks = getSidebarLinks(userInfo.role);

  const sidebarVariants: Variants = {
    open: (mobile: boolean) => ({
      x: 0,
      width: mobile ? '75vw' : '18rem',
      opacity: 1,
      transition: { type: 'spring', stiffness: 250, damping: 24 },
    }),
    closed: (mobile: boolean) => ({
      x: mobile ? '-100%' : 0,
      width: mobile ? 0 : '4rem',
      opacity: mobile ? 0 : 1,
      transition: { type: 'spring', stiffness: 250, damping: 24 },
    }),
  };

  const overlayVariants: Variants = {
    visible: { opacity: 0.5, pointerEvents: 'auto' },
    hidden: { opacity: 0, pointerEvents: 'none' },
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 relative">
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isSidebarOpen ? 'open' : 'closed'}
        custom={isMobile}
        variants={sidebarVariants}
        className={`relative z-50 bg-indigo-800 text-white shadow-xl overflow-hidden ${
          isMobile ? 'fixed h-full' : 'h-screen'
        }`}
      >
        <div className="flex flex-col h-full p-5">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6">
            {isSidebarOpen && (
              <motion.h2
                className="text-2xl font-bold text-yellow-300"
                animate={{ opacity: 1 }}
              >
                <i className="fas fa-graduation-cap mr-3"></i>StudyHub
              </motion.h2>
            )}
            <button
              aria-label="Toggle Sidebar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white text-xl p-2 hover:bg-indigo-700 rounded-md"
            >
              <i className={isSidebarOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            <ul>
              {sidebarLinks.map((link) => {
                const active =
                  location.pathname === link.path ||
                  (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
                return (
                  <motion.li
                    key={link.name}
                    className="mb-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                      className={`flex items-center p-3 rounded-lg transition-all duration-300 text-sm ${
                        active
                          ? 'bg-indigo-700 text-yellow-300 font-semibold'
                          : 'text-indigo-200 hover:bg-indigo-700'
                      }`}
                    >
                      <i className={`${link.icon} text-lg mr-3`} />
                      {isSidebarOpen && <span>{link.name}</span>}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer: User Info */}
          {isSidebarOpen && (
            <div className="pt-6 mt-auto border-t border-indigo-700">
              <p className="text-xs text-indigo-200">Logged in as:</p>
              <p className="font-bold text-white text-sm truncate">{`${userInfo.firstName} ${userInfo.lastName}`}</p>
              <p className="text-xs text-indigo-300 truncate">{userInfo.email}</p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-gray-50">
        <h1 className="text-2xl md:text-4xl font-bold text-indigo-900 mb-6 text-center md:text-left">
          Welcome, {userInfo.firstName}!
        </h1>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Custom Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #4c51bf; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default DashboardPage;
