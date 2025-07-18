/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminCoursesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, type Variants } from 'framer-motion'; // Import AnimatePresence and Variants
import CourseFormModal from '../../components/modals/CourseFormModal'; // Assuming this component is also well-styled

interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  yearLevel: string;
  academicYear?: string;
  term?: string;
  teacher?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const AdminCoursesPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Framer Motion Variants for page entry
  const pageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }, // Using easeOut cubic-bezier
  };

  // Framer Motion Variants for table rows
  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  const fetchCourses = useCallback(async () => {
    if (!userInfo?.token || userInfo.role !== 'admin') { // Ensure only admins can access
      setError('You are not authorized to view this page. Admin access required.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/courses', config);
      setCourses(data);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to fetch courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token, userInfo?.role]); // Added userInfo.role to dependency array

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAddCourseClick = () => {
    setSelectedCourse(null); // Set to null for "create" mode
    setIsModalOpen(true);
  };

  const handleEditCourseClick = (course: Course) => {
    setSelectedCourse(course); // Set the course for "edit" mode
    setIsModalOpen(true);
  };

  const handleSaveCourse = async () => {
    await fetchCourses(); // Re-fetch courses to update the list
    setIsModalOpen(false); // Close modal on successful save/create
    alert('Course saved successfully!'); // Provide user feedback
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!userInfo?.token || userInfo.role !== 'admin') {
      alert('You are not authorized to delete courses.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete course: "${courseName}"? This action cannot be undone.`)) {
      setDeleteLoading(courseId); // Set loading state for the specific course's delete button

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/courses/${courseId}`, config);
        await fetchCourses(); // Re-fetch courses to update the list
        alert('Course deleted successfully!'); // User feedback
      } catch (err: any) {
        console.error('Error deleting course:', err);
        setError(err.response?.data?.message || 'Failed to delete course.');
        alert(`Error deleting course: ${err.response?.data?.message || 'Please try again.'}`);
      } finally {
        setDeleteLoading(null); // Clear loading state
      }
    }
  };

  // --- Render Logic with Enhanced UI ---
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="admin-courses-page p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans antialiased text-gray-800 rounded-lg shadow-inner"
    >
      {/* Page Header */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4 flex items-center">
        <i className="fas fa-book-reader mr-3 text-indigo-600"></i> Manage Courses
      </h2>
      <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl">
        As an administrator, you can add new courses, update existing ones, and remove courses no longer offered at the college.
      </p>

      {/* Add New Course Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddCourseClick}
        className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 flex items-center justify-center font-semibold text-lg"
      >
        <i className="fas fa-plus mr-2 text-white"></i> Add New Course
      </motion.button>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-lg border border-blue-100 animate-pulse-fade">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Loading courses... Please wait. 🔄</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 px-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl shadow-md">
          <p className="text-2xl font-bold mb-3 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i> Oh snap! An Error Occurred.
          </p>
          <p className="text-lg mb-4">{error}</p>
          <p className="text-md text-red-700 font-semibold">
            Please check your network connection or try refreshing the page. If the issue persists, contact support.
          </p>
          <button
            onClick={fetchCourses}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
          >
            <i className="fas fa-redo-alt mr-2"></i> Retry Fetching Courses
          </button>
        </div>
      )}

      {/* No Courses Found State */}
      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-12 px-6 bg-blue-50 rounded-xl shadow-inner border-2 border-blue-200">
          <p className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Courses Found
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            It looks like there are no courses registered in the system yet.
            <br /> Click the "Add New Course" button above to get started! 🚀
          </p>
        </div>
      )}

      {/* Courses Table */}
      {!loading && !error && courses.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal table-auto">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Year Level
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Acad. Year
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Term
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Assigned Teacher
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {courses.map((course) => (
                    <motion.tr
                      key={course._id}
                      initial="hidden"
                      animate="visible"
                      variants={rowVariants}
                      exit="exit"
                      className="border-b border-gray-100 hover:bg-blue-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-5 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">
                        {course.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {course.code}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap"
                          title={course.description}> {/* Add title for full description on hover */}
                        {course.description || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {course.yearLevel}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {course.academicYear || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {course.term || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {course.teacher ? (
                          <span className="text-purple-700 font-medium">
                            {course.teacher.firstName} {course.teacher.lastName}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEditCourseClick(course)}
                          className="inline-flex items-center px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-medium mr-2 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          title="Edit course"
                        >
                          <i className="fas fa-edit mr-1"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id, course.name)}
                          className="inline-flex items-center px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md font-medium disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          disabled={deleteLoading === course._id}
                          title="Delete course"
                        >
                          {deleteLoading === course._id ? (
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                          ) : (
                            <i className="fas fa-trash-alt mr-1"></i>
                          )}
                          {deleteLoading === course._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Form Modal */}
      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseToEdit={selectedCourse}
        onSave={handleSaveCourse}
      />
    </motion.div>
  );
};

export default AdminCoursesPage;