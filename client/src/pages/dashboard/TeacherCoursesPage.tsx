import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
        };

        const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/courses', config);
        setCourses(data);
        setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch courses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherCourses();
  }, [userInfo]);

  const closeModal = () => setSelectedCourse(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="teacher-courses-page"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">My Courses</h2>
      <p className="text-gray-700 mb-4">Here are the courses you are currently teaching.</p>

      {loading ? (
        <div className="text-center py-10 text-gray-600">Loading your courses...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : courses.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">You are not currently assigned to teach any courses.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.name} ({course.code})</h3>
              <p className="text-gray-600 mb-3">{course.description || 'No description provided.'}</p>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Academic Year:</span> {course.academicYear || '2024/2025'}</p>
                <p><span className="font-medium">Term:</span> {course.term || 'First Term'}</p>
                <p><span className="font-medium">Students Enrolled:</span> {course.students.length}</p>
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-2">{selectedCourse.name} ({selectedCourse.code})</h2>
              <p className="mb-4 text-gray-700">{selectedCourse.description || 'No description provided.'}</p>
              <p className="mb-2"><strong>Academic Year:</strong> {selectedCourse.academicYear}</p>
              <p className="mb-2"><strong>Term:</strong> {selectedCourse.term}</p>
              <p className="mb-4"><strong>Total Students:</strong> {selectedCourse.students.length}</p>
              <div>
                <h4 className="font-semibold mb-2">Students List:</h4>
                <ul className="list-disc list-inside text-sm text-gray-800 max-h-40 overflow-y-auto">
                  {selectedCourse.students.map((s) => (
                    <li key={s._id}>
                      {s.user.firstName} {s.user.lastName} ({s.user.email})
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeacherCoursesPage;
