/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // Import easeOut for smoother transitions

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
          withCredentials: true, // Ensure cookies are sent
        };

        const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/courses', config);
        // Filter courses to only show those taught by the current teacher
        const teacherAssignedCourses = data.filter((course: Course) =>
          course.teacher && course.teacher._id === userInfo._id
        );
        setCourses(teacherAssignedCourses);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch courses. Please try again.');
        console.error('Error fetching teacher courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherCourses();
  }, [userInfo]); // Depend on userInfo to re-fetch if user changes

  const closeModal = () => setSelectedCourse(null);

  // Framer Motion Variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
    hover: { scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' } // shadow-md and shadow-lg equivalent
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
      className="teacher-courses-page p-4 sm:p-6 bg-gray-50 min-h-screen"
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-chalkboard-teacher mr-3 text-indigo-600"></i> My Courses
      </h2>
      <p className="text-gray-700 mb-8 text-lg">
        Explore the courses you are currently teaching, view their details, and see the enrolled students.
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="ml-4 text-lg text-gray-600">Loading your courses...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
          <p className="text-xl font-semibold mb-2 flex items-center justify-center">
            <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Courses!
          </p>
          <p>{error}</p>
          <p className="text-sm mt-3 text-red-500">Please ensure you are logged in as a teacher.</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-10 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
          <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Courses Assigned!
          </p>
          <p className="text-gray-600">
            You are not currently assigned to teach any courses. Please contact the administration if this is incorrect.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                custom={index} // For stagger effect if needed in future
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200 cursor-pointer flex flex-col justify-between transition-all duration-300 ease-in-out"
                onClick={() => setSelectedCourse(course)}
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <i className="fas fa-book-open text-green-500 mr-2"></i> {course.name} <span className="ml-2 text-blue-600 text-base font-semibold">({course.code})</span>
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
                    {course.description || 'No description provided for this course.'}
                  </p>
                </div>
                <div className="text-sm text-gray-700 space-y-1 mt-auto">
                  <p className="flex items-center"><span className="font-semibold w-28">Academic Year:</span> <span className="font-medium text-gray-800">{course.academicYear || 'N/A'}</span></p>
                  <p className="flex items-center"><span className="font-semibold w-28">Term:</span> <span className="font-medium text-gray-800">{course.term || 'N/A'}</span></p>
                  <p className="flex items-center"><span className="font-semibold w-28">Students:</span> <span className="font-bold text-blue-700">{course.students.length} enrolled</span></p>
                </div>
                <div className="mt-5 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); }}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-base font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                  >
                    View Details <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl relative transform scale-100 opacity-100"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl transition-colors duration-200"
                aria-label="Close modal"
              >
                &times;
              </button>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b pb-3 flex items-center">
                <i className="fas fa-info-circle mr-3 text-blue-600"></i>
                {selectedCourse.name} ({selectedCourse.code})
              </h2>
              <p className="mb-5 text-gray-700 leading-relaxed text-base">
                {selectedCourse.description || 'No detailed description available for this course.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-800 text-lg mb-1">
                    <strong className="font-semibold">Academic Year:</strong> <span className="text-blue-700">{selectedCourse.academicYear}</span>
                  </p>
                  <p className="text-gray-800 text-lg">
                    <strong className="font-semibold">Term:</strong> <span className="text-blue-700">{selectedCourse.term}</span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-800 text-lg mb-1">
                    <strong className="font-semibold">Total Students:</strong> <span className="text-green-700 font-bold">{selectedCourse.students.length}</span>
                  </p>
                  <p className="text-gray-800 text-lg">
                    <strong className="font-semibold">Teacher:</strong> <span className="text-purple-700">{selectedCourse.teacher?.firstName} {selectedCourse.teacher?.lastName}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
                  <i className="fas fa-users-class mr-2 text-orange-500"></i> Enrolled Students
                </h4>
                {selectedCourse.students.length > 0 ? (
                  <ul className="list-none space-y-2 text-base text-gray-800 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedCourse.students.map((s) => (
                      <li key={s._id} className="bg-gray-50 p-3 rounded-md flex items-center justify-between shadow-sm border border-gray-100">
                        <span className="font-medium text-gray-900">
                          <i className="fas fa-user-circle mr-2 text-blue-500"></i>
                          {s.user.firstName} {s.user.lastName}
                        </span>
                        <span className="text-sm text-gray-600">({s.user.email})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">No students are currently enrolled in this course.</p>
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