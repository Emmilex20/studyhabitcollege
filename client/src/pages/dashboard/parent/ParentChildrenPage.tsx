// src/pages/dashboard/parent/ParentChildrenPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // Import motion, AnimatePresence, and easeOut
import { useAuth } from '../../../context/AuthContext';

interface CourseSummary {
  _id: string;
  name: string;
  code: string;
}

interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  currentClass?: string;
  enrolledCourses: CourseSummary[];
  gradeAverage?: number;
  attendancePercentage?: number;
  avatarUrl?: string;
}

const ParentChildrenPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchChildren = async () => {
      if (!userInfo?.token) {
        setError('Authentication token missing. Please log in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
          withCredentials: true,
        };
        const response = await axios.get('https://studyhabitcollege.onrender.com/api/parents/me/children', config);
        setChildren(response.data.children || []);

        if (response.data.length > 0) {
          const firstChildId = response.data[0]._id;
          const pathParts = location.pathname.split('/');
          // Attempt to extract studentId from the URL (e.g., /dashboard/child/STUDENT_ID/grades)
          // Ensure we get the correct part after '/child/'
          const childPathIndex = pathParts.indexOf('child');
          const studentIdInUrl = childPathIndex > -1 ? pathParts[childPathIndex + 1] : undefined;

          // Check if the studentId in URL is one of the fetched children
          const isUrlIdValid = response.data.some((child: Child) => child._id === studentIdInUrl);

          const idToActivate = isUrlIdValid ? studentIdInUrl : firstChildId;
          setActiveChildId(idToActivate);

          // Only navigate if the current path is NOT already showing details for the active child
          // This prevents unnecessary re-navigations and history stack issues.
          if (!location.pathname.startsWith(`/dashboard/child/${idToActivate}/`)) {
            navigate(`/dashboard/child/${idToActivate}/grades`, { replace: true });
          }
        } else {
          // If no children found, clear active child and ensure no sub-route is active
          setActiveChildId(null);
          if (location.pathname.startsWith('/dashboard/child/')) {
            navigate('/dashboard', { replace: true }); // Or a more appropriate "no children" page
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching children:', err.response?.data?.message || err.message, err);
        setError(err.response?.data?.message || 'Failed to load children. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) {
      fetchChildren();
    } else {
      // If no userInfo or token, set loading false and error, but also clear children
      setLoading(false);
      setError('You must be logged in to view your children\'s profiles.');
      setChildren([]);
    }
  }, [userInfo, location.pathname, navigate]);

  // Framer Motion variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const childCardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
    hover: { scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' } // Tailwind shadow-md and shadow-lg
  };

  const navLinkVariants = {
    active: { backgroundColor: '#3b82f6', color: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    inactive: { backgroundColor: '#e5e7eb', color: '#4b5563' },
    hover: { scale: 1.05, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading your children's data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
      >
        <p className="text-xl font-semibold mb-2 flex items-center justify-center">
          <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Data!
        </p>
        <p>{error}</p>
        <p className="text-sm mt-3 text-red-500">Please try refreshing the page or contact support.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="parent-children-page p-4 sm:p-6 bg-gray-50 min-h-screen"
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-users mr-3 text-purple-500"></i> My Children
      </h2>

      {children.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 bg-blue-50 rounded-lg shadow-inner border border-blue-200"
        >
          <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Children Found!
          </p>
          <p className="text-gray-600">
            It seems no children are linked to your account. Please contact the school administration to link your child's profile.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <AnimatePresence>
            {children.map((child, index) => (
              <motion.div
                key={child._id}
                variants={childCardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                custom={index} // Stagger animation
                onClick={() => {
                  setActiveChildId(child._id);
                  navigate(`/dashboard/child/${child._id}/grades`); // Navigate to grades by default
                }}
                className={`relative bg-white p-6 rounded-xl shadow-md border cursor-pointer transition-all duration-300 ease-in-out transform
                  ${activeChildId === child._id ? 'border-blue-600 ring-4 ring-blue-200 shadow-xl' : 'border-gray-200 hover:border-blue-300'}`}
              >
                {child.avatarUrl ? (
                  <img src={child.avatarUrl} alt={`${child.firstName}'s avatar`} className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-2 border-blue-400" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 border-2 border-blue-400">
                    <i className="fas fa-user-graduate text-blue-500 text-3xl"></i>
                  </div>
                )}
                <h3 className="text-xl font-extrabold text-gray-800 text-center mb-1">
                  {child.firstName} {child.lastName}
                </h3>
                <p className="text-sm text-gray-500 text-center mb-3">ID: {child.studentId}</p>

                <div className="space-y-1">
                  <p className="text-base text-gray-700 flex items-center">
                    <i className="fas fa-school text-blue-500 mr-2"></i> Class: <span className="font-semibold ml-auto">{child.currentClass || 'N/A'}</span>
                  </p>
                  <p className="text-base text-gray-700 flex items-center">
                    <i className="fas fa-book-open text-green-500 mr-2"></i> Courses: <span className="font-semibold ml-auto">{child.enrolledCourses.length > 0 ? child.enrolledCourses.length : '0'}</span>
                  </p>
                  {typeof child.gradeAverage === 'number' && (
                    <p className="text-base text-gray-700 flex items-center">
                      <i className="fas fa-percent text-yellow-500 mr-2"></i> Grade Avg: <span className="font-bold ml-auto text-yellow-700">{child.gradeAverage.toFixed(1)}%</span>
                    </p>
                  )}
                  {typeof child.attendancePercentage === 'number' && (
                    <p className="text-base text-gray-700 flex items-center">
                      <i className="fas fa-calendar-check text-indigo-500 mr-2"></i> Attendance: <span className="font-bold ml-auto text-indigo-700">{child.attendancePercentage.toFixed(1)}%</span>
                    </p>
                  )}
                </div>

                {activeChildId === child._id && (
                  <div className="absolute inset-x-0 bottom-0 bg-blue-100 text-blue-800 text-center py-2 text-sm font-semibold rounded-b-xl">
                    Selected
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {activeChildId && children.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
            <i className="fas fa-chart-line mr-3 text-green-600"></i>
            {`Details for ${children.find(c => c._id === activeChildId)?.firstName} ${children.find(c => c._id === activeChildId)?.lastName}`}
          </h3>
          <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-4">
            <Link
              to={`/dashboard/child/${activeChildId}/grades`}
              className="group" // Add group for child hover effects
            >
              <motion.button
                variants={navLinkVariants}
                initial="inactive"
                animate={location.pathname.includes(`/child/${activeChildId}/grades`) ? 'active' : 'inactive'}
                whileHover="hover"
                className="py-3 px-6 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center"
              >
                <i className="fas fa-chart-pie mr-2 group-hover:scale-110 transition-transform"></i> Grades
              </motion.button>
            </Link>
            <Link
              to={`/dashboard/child/${activeChildId}/attendance`}
              className="group" // Add group for child hover effects
            >
              <motion.button
                variants={navLinkVariants}
                initial="inactive"
                animate={location.pathname.includes(`/child/${activeChildId}/attendance`) ? 'active' : 'inactive'}
                whileHover="hover"
                className="py-3 px-6 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center"
              >
                <i className="fas fa-calendar-alt mr-2 group-hover:scale-110 transition-transform"></i> Attendance
              </motion.button>
            </Link>
            {/* Add more detail navigation links here */}
            {/* Example: Health records, schedules, etc. */}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname} // Key for animating Outlet content
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ParentChildrenPage;