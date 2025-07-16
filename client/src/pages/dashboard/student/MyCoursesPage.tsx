// src/pages/dashboard/student/MyCoursesPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
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
        const response = await axios.get('http://localhost:5000/api/students/me/courses', { 
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        const data = response.data;
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (Array.isArray(data?.courses)) {
          setCourses(data.courses);
        } else {
          setCourses([]);
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

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading your courses...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="student-courses-page"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">My Courses</h2>
      <p className="text-gray-700 mb-4">These are the courses you're currently enrolled in.</p>

      {courses.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">You are not currently enrolled in any courses.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {course.name} ({course.code})
              </h3>
              <p className="text-gray-600 mb-3">
                {course.description || 'No description provided.'}
              </p>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Teacher:</span>{' '}
                  {course.teacher
                    ? `${course.teacher.firstName} ${course.teacher.lastName}`
                    : 'N/A'}
                </p>
                {course.schedule && (
                  <p>
                    <span className="font-medium">Schedule:</span> {course.schedule}
                  </p>
                )}
                {course.roomNumber && (
                  <p>
                    <span className="font-medium">Room:</span> {course.roomNumber}
                  </p>
                )}
                {course.academicYear && (
                  <p>
                    <span className="font-medium">Academic Year:</span> {course.academicYear}
                  </p>
                )}
                {course.term && (
                  <p>
                    <span className="font-medium">Term:</span> {course.term}
                  </p>
                )}
              </div>
              {/* Optional button */}
              {/* <div className="mt-4 text-right">
                <button
                  onClick={() => alert(`View details for ${course.name}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  View Details
                </button>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyCoursesPage;
