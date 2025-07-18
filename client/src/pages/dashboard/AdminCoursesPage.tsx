/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminCoursesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import CourseFormModal from '../../components/modals/CourseFormModal';

interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  yearLevel: string;
  // ✨ ADDED: academicYear and term properties
  academicYear?: string; // Make optional if it might not always be present
  term?: string;         // Make optional if it might not always be present
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

  const fetchCourses = useCallback(async () => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch courses.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAddCourseClick = () => {
    setSelectedCourse(null); // Open modal in create mode
    setIsModalOpen(true);
  };

  const handleEditCourseClick = (course: Course) => {
    setSelectedCourse(course); // Open modal in edit mode
    setIsModalOpen(true);
  };

  const handleSaveCourse = async () => {
    await fetchCourses(); // Refresh list after save
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete course: ${courseName}? This action cannot be undone.`)) {
      setDeleteLoading(courseId);

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/courses/${courseId}`, config);
        await fetchCourses();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete course.');
        console.error(err);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600">
        <i className="fas fa-spinner fa-spin text-2xl mr-2"></i> Loading courses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <i className="fas fa-exclamation-circle text-2xl mr-2"></i> {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="admin-courses-page p-6 bg-gray-50 min-h-screen" // Added padding and background
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-book-reader mr-3 text-indigo-600"></i> Manage Courses
      </h2>
      <p className="text-gray-700 mb-4">Here you can add, edit, or delete courses offered at the college. 📝</p>

      <button
        onClick={handleAddCourseClick}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
      >
        <i className="fas fa-plus mr-2"></i> Add New Course
      </button>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year Level</th>
              {/* ✨ ADDED: New Table Headers */}
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Academic Year</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Term</th>
              {/* END ADDED */}
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Teacher</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{course.name}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{course.code}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{course.description || 'N/A'}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{course.yearLevel}</td>
                {/* ✨ ADDED: New Table Data Cells */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{course.academicYear || 'N/A'}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{course.term || 'N/A'}</td>
                {/* END ADDED */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Unassigned'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap">
                  <button
                    onClick={() => handleEditCourseClick(course)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id, course.name)}
                    className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                    disabled={deleteLoading === course._id}
                  >
                    {deleteLoading === course._id ? (
                      <i className="fas fa-spinner fa-spin mr-1"></i>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {courses.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500 mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <i className="fas fa-info-circle mr-2"></i> No courses found. Click "Add New Course" to get started!
        </p>
      )}

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