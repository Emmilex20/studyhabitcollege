import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Link, Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, easeOut } from 'framer-motion';
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
  gradeAverage?: number; // Added for general display
  attendancePercentage?: number; // Added for general display
  gpa?: number; // Added for specific display in ParentDashboardOverview
  letterGrade?: string; // Added for specific display in ParentDashboardOverview
  avatarUrl?: string;
}

const ParentChildrenPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // ⭐ New state to control initial navigation ⭐
  const hasNavigatedInitially = useRef(false); // Using useRef to persist value without re-renders

  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useParams<{ studentId?: string }>(); // Get studentId from URL params

  // Determine if a child-specific sub-route (grades/attendance) is currently active
  const isChildDetailRouteActive = studentId && (
    location.pathname.includes(`/children/${studentId}/grades`) ||
    location.pathname.includes(`/children/${studentId}/attendance`)
  );

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
        const fetchedChildren: Child[] = response.data.children || [];
        setChildren(fetchedChildren);

        // ⭐ Modified navigation logic ⭐
        // Only attempt initial navigation if we haven't already AND
        // if we are currently at the base /dashboard/children route AND
        // if there are children to display.
        if (
          !hasNavigatedInitially.current && // Check the ref value
          !studentId && // No student ID in URL
          fetchedChildren.length > 0 && // Children exist
          location.pathname === '/dashboard/children' // At the base path
        ) {
          navigate(`/dashboard/children/${fetchedChildren[0]._id}/grades`, { replace: true });
          hasNavigatedInitially.current = true; // Set the flag to true after navigation
        } else if (studentId && !fetchedChildren.some(child => child._id === studentId)) {
          // If studentId in URL is not valid for this parent, navigate away or show error
          console.warn(`Attempted to access invalid child ID: ${studentId}. Navigating to children list.`);
          navigate('/dashboard/children', { replace: true });
        } else if (!studentId && fetchedChildren.length === 0 && location.pathname !== '/dashboard/children') {
          // If no children and we are on a nested route (e.g. /dashboard/children/someid/grades), redirect to base
          navigate('/dashboard/children', { replace: true });
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching children:', err.response?.data?.message || err.message, err);
        setError(err.response?.data?.message || 'Failed to load children. Please try again.');
        setChildren([]);
        // Reset navigation flag if there's an error and no children are loaded
        hasNavigatedInitially.current = false;
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) {
      fetchChildren();
    } else {
      setLoading(false);
      setError('You must be logged in to view your children\'s profiles.');
      setChildren([]);
    }
  }, [userInfo, studentId, location.pathname, navigate]); // Dependencies remain the same

  // Framer Motion variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const childCardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.1, // Stagger animation
        duration: 0.4,
        ease: easeOut
      }
    }),
    hover: { scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }
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
        <>
          {/* Only show the list if no specific child detail route is active */}
          {!isChildDetailRouteActive ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              <AnimatePresence>
                {children.map((child, index) => {
                  const displayGPA = typeof child.gpa === 'number' ? child.gpa : null;
                  const displayAttendancePercentage = typeof child.attendancePercentage === 'number' ? child.attendancePercentage : null;
                  const displayGradeAverage = typeof child.gradeAverage === 'number' ? child.gradeAverage : null;

                  return (
                    <motion.div
                      key={child._id}
                      variants={childCardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={index} // Stagger animation
                      onClick={() => {
                        navigate(`/dashboard/children/${child._id}/grades`); // Navigate to grades by default on card click
                      }}
                      className={`relative bg-white p-6 rounded-xl shadow-md border cursor-pointer transition-all duration-300 ease-in-out transform
                        ${studentId === child._id ? 'border-blue-600 ring-4 ring-blue-200 shadow-xl' : 'border-gray-200 hover:border-blue-300'}`}
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
                        {typeof displayGradeAverage === 'number' && (
                          <p className="text-base text-gray-700 flex items-center">
                            <i className="fas fa-percent text-yellow-500 mr-2"></i> Grade Avg: <span className="font-bold ml-auto text-yellow-700">{displayGradeAverage.toFixed(1)}%</span>
                          </p>
                        )}
                         {typeof displayGPA === 'number' && ( // Display GPA if available, potentially as primary grade metric
                          <p className="text-base text-gray-700 flex items-center">
                            <i className="fas fa-graduation-cap text-indigo-500 mr-2"></i> GPA: <span className="font-bold ml-auto text-indigo-700">{displayGPA.toFixed(2)}</span>
                          </p>
                        )}
                        {typeof displayAttendancePercentage === 'number' && (
                          <p className="text-base text-gray-700 flex items-center">
                            <i className="fas fa-calendar-check text-purple-500 mr-2"></i> Attendance: <span className="font-bold ml-auto text-purple-700">{displayAttendancePercentage.toFixed(1)}%</span>
                          </p>
                        )}
                      </div>

                      {studentId === child._id && (
                        <div className="absolute inset-x-0 bottom-0 bg-blue-100 text-blue-800 text-center py-2 text-sm font-semibold rounded-b-xl">
                          Selected
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : ( // Show the detail section if a specific child is selected
            <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <Link to="/dashboard/children" className="text-blue-600 hover:underline mb-4 inline-flex items-center text-sm font-medium">
                  <i className="fas fa-arrow-left mr-2"></i> Back to Children List
              </Link>
              <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                <i className="fas fa-chart-line mr-3 text-green-600"></i>
                {`Details for ${children.find(c => c._id === studentId)?.firstName || 'Selected'} ${children.find(c => c._id === studentId)?.lastName || 'Child'}`}
              </h3>
              <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-4">
                <Link
                  to={`/dashboard/children/${studentId}/grades`}
                  className="group"
                >
                  <motion.button
                    variants={navLinkVariants}
                    initial="inactive"
                    animate={location.pathname.includes(`/children/${studentId}/grades`) ? 'active' : 'inactive'}
                    whileHover="hover"
                    className="py-3 px-6 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-chart-pie mr-2 group-hover:scale-110 transition-transform"></i> Grades
                  </motion.button>
                </Link>
                <Link
                  to={`/dashboard/children/${studentId}/attendance`}
                  className="group"
                >
                  <motion.button
                    variants={navLinkVariants}
                    initial="inactive"
                    animate={location.pathname.includes(`/children/${studentId}/attendance`) ? 'active' : 'inactive'}
                    whileHover="hover"
                    className="py-3 px-6 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-calendar-alt mr-2 group-hover:scale-110 transition-transform"></i> Attendance
                  </motion.button>
                </Link>
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
        </>
      )}
    </motion.div>
  );
};

export default ParentChildrenPage;