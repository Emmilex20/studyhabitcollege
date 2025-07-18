// src/pages/DashboardPage.tsx
import React from 'react';
import { motion, easeOut } from 'framer-motion'; // Import easeOut
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { userInfo } = useAuth();
  const location = useLocation(); // To highlight active sidebar link

  if (!userInfo) {
    return (
      <div className="text-center py-20 text-xl text-gray-600">
        Loading user information or not authenticated...
      </div>
    );
  }

  // Define sidebar links based on user role
  const getSidebarLinks = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Overview', path: '/dashboard' },
          { name: 'Manage Users', path: '/dashboard/users' },
          { name: 'Manage Courses', path: '/dashboard/courses' },
          { name: 'Manage Students', path: '/dashboard/students' },
          { name: 'Manage Grades', path: '/dashboard/grades' },
          { name: 'Manage Attendance', path: '/dashboard/attendance' },
          { name: 'Manage Events', path: '/dashboard/events' },
          { name: 'Manage Gallery', path: '/dashboard/gallery' },
          { name: 'Announcements', path: '/dashboard/announcements' },
          { name: 'Settings', path: '/dashboard/settings' },
        ];
      case 'teacher':
        return [
          { name: 'Overview', path: '/dashboard' },
          { name: 'My Courses', path: '/dashboard/teacher-courses' },
          { name: 'My Students', path: '/dashboard/teacher-students' },
          { name: 'Gradebook', path: '/dashboard/teacher-gradebook' },
          { name: 'Record Attendance', path: '/dashboard/teacher-attendance' },
          { name: 'Events', path: '/dashboard/events' },
          { name: 'Announcements', path: '/dashboard/announcements' },
          { name: 'Settings', path: '/dashboard/settings' },
        ];
      case 'student':
        return [
          { name: 'Overview', path: '/dashboard' },
          { name: 'My Courses', path: '/dashboard/student-course' },
          { name: 'My Grades', path: '/dashboard/student-grades' },
          { name: 'Attendance', path: '/dashboard/student-attendance' },
          { name: 'Announcements', path: '/dashboard/announcements' },
          { name: 'Events', path: '/dashboard/events' },
          { name: 'Settings', path: '/dashboard/settings' },
        ];
      case 'parent':
        return [
          { name: 'Overview', path: '/dashboard' },
          { name: 'My Children', path: '/dashboard/child' },
          { name: 'Announcements', path: '/dashboard/announcements' },
          { name: 'Events', path: '/dashboard/events' },
          { name: 'Settings', path: '/dashboard/settings' },
        ];

      default:
        return [{ name: 'Overview', path: '/dashboard' }];
    }
  };

  const sidebarLinks = getSidebarLinks(userInfo.role);

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-blue-900 text-white shadow-lg p-6 md:sticky md:top-[80px] self-start">
        <h2 className="text-2xl font-bold mb-6 border-b border-blue-700 pb-3">
          {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)} Dashboard
        </h2>
        <nav>
          <ul>
            {sidebarLinks.map((link) => (
              <li key={link.name} className="mb-3">
                <Link
                  to={link.path}
                  className={`flex items-center p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 ${
                    // Highlight based on exact path match for overview, or startsWith for sub-paths
                    location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path))
                      ? 'bg-blue-700 font-semibold'
                      : ''
                  }`}
                >
                  <i className="fas fa-arrow-right mr-3"></i> {/* Replace with relevant icons later */}
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* User Info in Sidebar */}
        <div className="mt-8 pt-4 border-t border-blue-700">
            <p className="text-sm text-gray-300">Logged in as:</p>
            <p className="font-semibold text-lg">{userInfo.firstName} {userInfo.lastName}</p>
            <p className="text-sm text-gray-400">{userInfo.email}</p>
        </div>
      </aside>

      {/* Main Content Area - This is where sub-routes will render */}
      <main className="flex-1 p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }} // Added easeOut here
          className="bg-white p-8 rounded-lg shadow-xl min-h-[50vh]"
        >
          <Outlet /> {/* This is where the nested route components will render */}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;