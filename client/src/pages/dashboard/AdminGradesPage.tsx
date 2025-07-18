/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminGradesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, type Variants } from 'framer-motion'; // Import AnimatePresence and Variants
import GradeFormModal from '../../components/modals/GradeFormModal';

interface Grade {
  _id: string;
  student: { _id: string; user: { _id: string; firstName: string; lastName: string; }; studentId: string; };
  course: { _id: string; name: string; code: string; };
  teacher: { _id: string; firstName: string; lastName: string; };
  gradeType: string;
  assignmentName?: string;
  score: number;
  maxScore: number;
  weight: number;
  term: string;
  academicYear: string;
  dateGraded: string;
  remarks?: string;
}

const AdminGradesPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null); // For editing
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Framer Motion Variants for page entry
  const pageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }, // Using easeOut cubic-bezier
  };

  // Framer Motion Variants for table rows (for enter/exit animations)
  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  const fetchGrades = useCallback(async () => {
    // Ensure only admins can access this page
    if (!userInfo?.token || userInfo.role !== 'admin') {
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
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/grades', config);
      setGrades(data);
    } catch (err: any) {
      console.error('Error fetching grades:', err);
      setError(err.response?.data?.message || 'Failed to fetch grades. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token, userInfo?.role]); // Added userInfo.role to dependencies

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]); // Use fetchGrades directly, it's already memoized with useCallback

  const handleAddGradeClick = () => {
    setSelectedGrade(null); // Clear selection for create mode
    setIsModalOpen(true);
  };

  const handleEditGradeClick = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsModalOpen(true);
  };

  const handleSaveGrade = async () => {
    await fetchGrades(); // Re-fetch all grades to ensure the list is up-to-date
    setIsModalOpen(false); // Close modal on successful save
    alert('Grade saved successfully!'); // Provide user feedback
  };

  const handleDeleteGrade = async (gradeId: string, studentName: string, courseName: string, gradeType: string, assignmentName?: string) => {
    if (!userInfo?.token || userInfo.role !== 'admin') {
      alert('You are not authorized to delete grades.');
      return;
    }

    let confirmMessage = `Are you sure you want to delete the ${gradeType}`;
    if (assignmentName) {
      confirmMessage += ` "${assignmentName}"`;
    }
    confirmMessage += ` grade for ${studentName} in ${courseName}? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      setDeleteLoading(gradeId); // Set loading state for the specific grade's delete button
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/grades/${gradeId}`, config);
        await fetchGrades(); // Re-fetch grades to update the list
        alert('Grade deleted successfully!'); // User feedback
      } catch (err: any) {
        console.error('Error deleting grade:', err);
        setError(err.response?.data?.message || 'Failed to delete grade.');
        alert(`Error deleting grade: ${err.response?.data?.message || 'Please try again.'}`);
      } finally {
        setDeleteLoading(null); // Clear loading state
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="admin-grades-page p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans antialiased text-gray-800 rounded-lg shadow-inner"
    >
      {/* Page Header */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4 flex items-center">
        <i className="fas fa-percent mr-3 text-indigo-600"></i> Manage Grades
      </h2>
      <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl">
        As an administrator, you have comprehensive control over all student grades. You can add new grade entries, modify existing ones, or remove records as needed.
      </p>

      {/* Add New Grade Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddGradeClick}
        className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 flex items-center justify-center font-semibold text-lg"
      >
        <i className="fas fa-plus mr-2 text-white"></i> Add New Grade
      </motion.button>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-lg border border-blue-100 animate-pulse-fade">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Loading grade data... Please wait. 📊</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 px-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl shadow-md">
          <p className="text-2xl font-bold mb-3 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i> Error Loading Grades!
          </p>
          <p className="text-lg mb-4">{error}</p>
          <p className="text-md text-red-700 font-semibold">
            Please check your network connection or ensure you have administrative privileges.
          </p>
          <button
            onClick={fetchGrades}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
          >
            <i className="fas fa-redo-alt mr-2"></i> Retry Fetching Grades
          </button>
        </div>
      )}

      {/* No Grades Found State */}
      {!loading && !error && grades.length === 0 && (
        <div className="text-center py-12 px-6 bg-blue-50 rounded-xl shadow-inner border-2 border-blue-200">
          <p className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Grade Records Found
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            There are currently no grade entries in the system.
            <br /> Click the "Add New Grade" button above to start recording student performance! 📝
          </p>
        </div>
      )}

      {/* Grades Table */}
      {!loading && !error && grades.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal table-auto">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Student
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Course
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Type & Name
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Score (Weight)
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Term
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Academic Year
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Recorded By
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Date Graded
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {grades.map((grade) => (
                    <motion.tr
                      key={grade._id}
                      initial="hidden"
                      animate="visible"
                      variants={rowVariants}
                      exit="exit"
                      className="border-b border-gray-100 hover:bg-blue-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-5 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-xs">
                              {grade.student?.user?.firstName?.[0]}{grade.student?.user?.lastName?.[0]}
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-gray-900 font-medium">{grade.student?.user?.firstName} {grade.student?.user?.lastName}</p>
                            <p className="text-gray-600 text-xs mt-0.5">ID: {grade.student?.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        <span className="font-semibold text-purple-700">{grade.course?.name}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">({grade.course?.code})</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        <span className="font-medium text-blue-800">{grade.gradeType}</span>
                        {grade.assignmentName && <span className="block text-xs text-gray-500 italic mt-0.5">({grade.assignmentName})</span>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        <span className="font-bold text-lg text-blue-700">
                          {grade.score}
                        </span>
                        <span className="text-gray-600"> / {grade.maxScore}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">(Weight: {grade.weight}%)</span>
                        {grade.remarks && <p className="text-xs text-gray-500 italic mt-1 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={grade.remarks}>{grade.remarks}</p>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{grade.term}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{grade.academicYear}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        <span className="text-green-700 font-medium">
                          {grade.teacher?.firstName} {grade.teacher?.lastName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {new Date(grade.dateGraded).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEditGradeClick(grade)}
                          className="inline-flex items-center px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-medium mr-2 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          title="Edit grade"
                        >
                          <i className="fas fa-edit mr-1"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGrade(
                            grade._id,
                            `${grade.student?.user?.firstName} ${grade.student?.user?.lastName}`,
                            grade.course?.name || '',
                            grade.gradeType,
                            grade.assignmentName
                          )}
                          className="inline-flex items-center px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md font-medium disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          disabled={deleteLoading === grade._id}
                          title="Delete grade"
                        >
                          {deleteLoading === grade._id ? (
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                          ) : (
                            <i className="fas fa-trash-alt mr-1"></i>
                          )}
                          {deleteLoading === grade._id ? 'Deleting...' : 'Delete'}
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

      <GradeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gradeToEdit={selectedGrade}
        onSave={handleSaveGrade}
      />
    </motion.div>
  );
};

export default AdminGradesPage;