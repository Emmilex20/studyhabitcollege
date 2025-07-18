import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, easeOut } from 'framer-motion';

// Define the Course interface as provided
interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  teacher: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  students: {
    _id: string;
    studentId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
  academicYear: string;
  term: string;
}

const TeacherCoursesPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchTeacherCourses = async () => {
      // Early exit if not authorized or not a teacher
      if (!userInfo?.token || userInfo.role !== 'teacher') {
        setError('Not authorized or logged in as a teacher.');
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

        const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/courses', config);

        // Filter courses to only show those taught by the current teacher
        const teacherAssignedCourses = data.filter((course: Course) =>
          course.teacher && course.teacher._id === userInfo._id
        );

        // Ensure academicYear and term are valid strings
        const cleanedCourses = teacherAssignedCourses.map((course: Course) => ({
          ...course,
          academicYear: course.academicYear ?? 'N/A', // Nullish coalescing for better defaults
          term: course.term ?? 'N/A',
        }));

        setCourses(cleanedCourses);
        setError(null); // Clear any previous errors on successful fetch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        // More robust error handling for API failures
        const errorMessage = err.response?.data?.message || 'Failed to fetch courses. Please try again later.';
        setError(errorMessage);
        console.error('Error fetching teacher courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherCourses();
  }, [userInfo]); // Depend on userInfo to re-fetch if user data changes

  const closeModal = () => setSelectedCourse(null);

  // Framer Motion Variants for smooth transitions
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
    hover: { scale: 1.02, boxShadow: '0 15px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' } // Stronger hover shadow
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
    exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2, ease: easeOut } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="teacher-courses-page p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans antialiased text-gray-800"
    >
      {/* Page Title and Description */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4 flex items-center">
        <i className="fas fa-chalkboard-teacher mr-3 text-indigo-600"></i> My Courses
      </h2>
      <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl">
        Explore the courses you are currently teaching, view their detailed information, and see the enrolled students. This helps you manage your teaching assignments efficiently. 📚
      </p>

      {/* Conditional Rendering for Loading, Error, or Empty States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-lg border border-blue-100 animate-pulse-fade">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Loading your courses... Please wait. 🔄</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 px-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl shadow-md">
          <p className="text-2xl font-bold mb-3 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i> Error Loading Courses!
          </p>
          <p className="text-lg mb-4">{error}</p>
          <p className="text-md text-red-700 font-semibold">
            Please ensure you are properly authenticated and your role is set to 'teacher'. If the problem persists, contact support. ⚠️
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
          >
            <i className="fas fa-redo-alt mr-2"></i> Retry
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 px-6 bg-blue-50 rounded-xl shadow-inner border-2 border-blue-200">
          <p className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Courses Assigned
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            It appears you are not currently assigned to teach any courses for the active academic period.
            <br /> If you believe this is an error, please contact the academic administration or your department head. 😔
          </p>
          <button
            onClick={() => alert('Contacting administration... (Simulated)')} // Replace with actual contact logic
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
          >
            <i className="fas fa-headset mr-2"></i> Contact Administration
          </button>
        </div>
      ) : (
        // Course Grid Display
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence>
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                custom={index} // For potential stagger children in future, if desired
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 cursor-pointer flex flex-col justify-between transition-all duration-300 ease-in-out hover:border-blue-300 hover:shadow-xl"
                onClick={() => setSelectedCourse(course)}
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center leading-tight">
                    <i className="fas fa-book-open text-green-600 mr-2"></i> {course.name}
                  </h3>
                  <p className="text-blue-600 text-base font-semibold mb-3">({course.code})</p>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                    {course.description || 'A detailed description for this course is not yet available. Click "View Details" to see more.'}
                  </p>
                </div>
                <div className="text-sm text-gray-700 space-y-2 mt-auto pt-4 border-t border-gray-100">
                  <p className="flex items-center">
                    <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Academic Year:</span>{' '}
                    <span className="font-medium text-blue-700">{course.academicYear}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Term:</span>{' '}
                    <span className="font-medium text-blue-700">{course.term}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Students:</span>{' '}
                    <span className="font-bold text-green-700 text-base">{course.students.length} enrolled</span>
                  </p>
                </div>
                <div className="mt-6 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); }}
                    className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-base font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                    aria-label={`View details for ${course.name}`}
                  >
                    View Details <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal} // Click outside to close
          >
            <motion.div
              className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-3xl lg:max-w-4xl shadow-2xl relative transform scale-100 opacity-100"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl transition-colors duration-200"
                aria-label="Close modal"
              >
                &times;
              </button>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 border-b-2 border-blue-100 pb-3 flex items-center leading-tight">
                <i className="fas fa-info-circle mr-3 text-blue-600"></i>
                {selectedCourse.name} <span className="ml-2 text-gray-600">({selectedCourse.code})</span>
              </h2>
              <p className="mb-6 text-gray-700 leading-relaxed text-base sm:text-lg">
                {selectedCourse.description || 'No detailed description available for this course. For more information, please refer to the course catalog.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6">
                <div>
                  <p className="text-gray-800 text-lg mb-2">
                    <strong className="font-semibold text-gray-900">Academic Year:</strong>{' '}
                    <span className="text-blue-700 font-medium">{selectedCourse.academicYear}</span>
                  </p>
                  <p className="text-gray-800 text-lg">
                    <strong className="font-semibold text-gray-900">Term:</strong>{' '}
                    <span className="text-blue-700 font-medium">{selectedCourse.term}</span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-800 text-lg mb-2">
                    <strong className="font-semibold text-gray-900">Total Students:</strong>{' '}
                    <span className="text-green-700 font-bold text-xl">{selectedCourse.students.length}</span>
                  </p>
                  <p className="text-gray-800 text-lg">
                    <strong className="font-semibold text-gray-900">Teacher:</strong>{' '}
                    <span className="text-purple-700 font-medium">{selectedCourse.teacher?.firstName} {selectedCourse.teacher?.lastName}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-3">
                  <i className="fas fa-users-class mr-2 text-orange-600"></i> Enrolled Students
                </h4>
                {selectedCourse.students.length > 0 ? (
                  <ul className="list-none space-y-3 text-base text-gray-800 max-h-80 sm:max-h-96 overflow-y-auto pr-3 custom-scrollbar">
                    {selectedCourse.students.map((s) => (
                      <li key={s._id} className="bg-blue-50 p-3 sm:p-4 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
                        <span className="font-medium text-gray-900 text-lg flex items-center mb-1 sm:mb-0">
                          <i className="fas fa-user-circle mr-2 text-blue-500"></i>
                          {s.user.firstName} {s.user.lastName}
                        </span>
                        <span className="text-sm text-gray-600 sm:ml-4">({s.user.email})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-gray-100 p-5 rounded-lg text-center border border-gray-200">
                    <p className="text-gray-600 italic text-lg flex items-center justify-center">
                      <i className="fas fa-sad-tear mr-3 text-gray-500"></i> No students are currently enrolled in this course.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Enrollment updates typically happen at the beginning of each term.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeacherCoursesPage;