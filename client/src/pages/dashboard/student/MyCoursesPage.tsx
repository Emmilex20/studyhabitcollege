// src/pages/dashboard/student/MyCoursesPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import { useAuth } from '../../../context/AuthContext';

interface Teacher {
  firstName: string;
  lastName: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  schedule?: string;
  roomNumber?: string;
  academicYear?: string;
  term?: string;
  teacher?: Teacher;
}

const MyCoursesPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!userInfo?.token || userInfo.role !== 'student') {
        setError('You must be logged in as a student to view your courses.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Using a more specific endpoint if available, otherwise current one is fine
        const response = await axios.get('https://studyhabitcollege.onrender.com/api/students/me/courses', {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        const data = response.data;
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data && Array.isArray(data.courses)) { // Handle common API response structures
          setCourses(data.courses);
        } else {
          setCourses([]); // Ensure courses is always an array
        }

        setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(err.response?.data?.message || 'Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userInfo]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger animation for individual course cards
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
        <p className="text-xl font-semibold mb-2">Error! 😔</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="my-courses-page p-4 sm:p-0" // Add responsive padding
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4 sm:mb-6 flex items-center">
        <i className="fas fa-book-reader mr-3 text-yellow-500"></i> My Courses
      </h2>
      <p className="text-gray-700 mb-6 text-lg">
        Explore the courses you're currently enrolled in. Stay updated on your schedule and teachers.
      </p>

      {courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 bg-blue-50 rounded-lg shadow-inner border border-blue-200"
        >
          <p className="text-xl font-semibold text-blue-600 mb-3">No Courses Found! 📚</p>
          <p className="text-gray-600">
            It looks like you haven't been assigned to any courses yet. Please check back later or contact your administration.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants} // Apply container variants here for stagger
        >
          <AnimatePresence>
            {courses.map((course) => (
              <motion.div
                key={course._id}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 cursor-pointer flex flex-col h-full"
              >
                <h3 className="text-xl font-bold text-blue-700 mb-2">
                  {course.name} <span className="text-blue-500 font-medium">({course.code})</span>
                </h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {course.description || 'No detailed description available for this course.'}
                </p>
                <div className="text-sm text-gray-700 space-y-2 pt-3 border-t border-gray-100">
                  <p className="flex items-center">
                    <i className="fas fa-chalkboard-teacher mr-2 text-blue-500"></i>
                    <span className="font-semibold">Teacher:</span>{' '}
                    {course.teacher
                      ? `${course.teacher.firstName} ${course.teacher.lastName}`
                      : 'Not assigned'}
                  </p>
                  {course.schedule && (
                    <p className="flex items-center">
                      <i className="fas fa-clock mr-2 text-green-500"></i>
                      <span className="font-semibold">Schedule:</span> {course.schedule}
                    </p>
                  )}
                  {course.roomNumber && (
                    <p className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>
                      <span className="font-semibold">Room:</span> {course.roomNumber}
                    </p>
                  )}
                  {course.academicYear && (
                    <p className="flex items-center">
                      <i className="fas fa-calendar-alt mr-2 text-purple-500"></i>
                      <span className="font-semibold">Academic Year:</span> {course.academicYear}
                    </p>
                  )}
                  {course.term && (
                    <p className="flex items-center">
                      <i className="fas fa-calendar-check mr-2 text-orange-500"></i>
                      <span className="font-semibold">Term:</span> {course.term}
                    </p>
                  )}
                </div>
                {/* Optional CTA or action button */}
                <div className="mt-5 text-right">
                  <button
                    onClick={() => alert(`Navigating to ${course.name} details...`)}
                    className="inline-flex items-center px-5 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    View Details <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MyCoursesPage;