/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminStudentsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import StudentFormModal from '../../components/modals/StudentFormModal'; // Assuming this component is well-styled

interface Student {
  _id: string;
  user: { _id: string; firstName: string; lastName: string; email: string };
  studentId: string;
  dateOfBirth: string; // Consider using Date type if you perform date operations
  gender: string;
  currentClass?: string;
  // ⭐ Added currentTerm property ⭐
  currentTerm?: string; // Assuming 'Term 1', 'Term 2', 'Term 3' or similar
  enrolledCourses: { _id: string; name: string; code: string }[];
  parent?: { _id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
}

const AdminStudentsPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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

  const fetchStudents = useCallback(async () => {
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
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/students', config);
      setStudents(data);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token, userInfo?.role]); // Added userInfo.role to dependencies

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudentClick = () => {
    setSelectedStudent(null); // Set to null for "create" mode
    setIsModalOpen(true);
  };

  const handleEditStudentClick = (student: Student) => {
    setSelectedStudent(student); // Set the student for "edit" mode
    setIsModalOpen(true);
  };

  const handleSaveStudent = async () => {
    await fetchStudents(); // Re-fetch students to update the list
    setIsModalOpen(false); // Close modal on successful save/create
    alert('Student record saved successfully!'); // Provide user feedback
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!userInfo?.token || userInfo.role !== 'admin') {
      alert('You are not authorized to delete student records.');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete student record for: "${studentName}"? This will delete their student profile, but not their user account.`
      )
    ) {
      setDeleteLoading(studentId); // Set loading state for the specific student's delete button
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/students/${studentId}`, config);
        await fetchStudents(); // Re-fetch students to update the list
        alert('Student record deleted successfully!'); // User feedback
      } catch (err: any) {
        console.error('Error deleting student record:', err);
        setError(err.response?.data?.message || 'Failed to delete student record.');
        alert(`Error deleting student record: ${err.response?.data?.message || 'Please try again.'}`);
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
      className="admin-students-page p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans antialiased text-gray-800 rounded-lg shadow-inner"
    >
      {/* Page Header */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4 flex items-center">
        <i className="fas fa-user-graduate mr-3 text-indigo-600"></i> Manage Students
      </h2>
      <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl">
        As an administrator, you can view, add, edit, and delete student records within the system. Ensure all student information is accurate and up-to-date.
      </p>

      {/* Add New Student Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddStudentClick}
        className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 flex items-center justify-center font-semibold text-lg"
      >
        <i className="fas fa-plus mr-2 text-white"></i> Add New Student
      </motion.button>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-lg border border-blue-100 animate-pulse-fade">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Fetching student data... Please wait. 🔄</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 px-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl shadow-md">
          <p className="text-2xl font-bold mb-3 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i> Error Loading Students!
          </p>
          <p className="text-lg mb-4">{error}</p>
          <p className="text-md text-red-700 font-semibold">
            Please check your network connection or ensure you have administrative privileges.
          </p>
          <button
            onClick={fetchStudents}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
          >
            <i className="fas fa-redo-alt mr-2"></i> Retry Fetching Students
          </button>
        </div>
      )}

      {/* No Students Found State */}
      {!loading && !error && students.length === 0 && (
        <div className="text-center py-12 px-6 bg-blue-50 rounded-xl shadow-inner border-2 border-blue-200">
          <p className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Student Records Found
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            There are currently no student records in the system.
            <br /> Click the "Add New Student" button above to begin enrolling students! 🧑‍🎓
          </p>
        </div>
      )}

      {/* Students Table */}
      {!loading && !error && students.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal table-auto">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Student ID
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Class
                  </th>
                  {/* ⭐ New Term Header ⭐ */}
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Term
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {students.map((student) => (
                    <motion.tr
                      key={student._id}
                      initial="hidden"
                      animate="visible"
                      variants={rowVariants}
                      exit="exit"
                      className="border-b border-gray-100 hover:bg-blue-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-5 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {student.studentId}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-sm">
                              {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-gray-900 font-medium">{student.user?.firstName} {student.user?.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{student.user?.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {student.currentClass || (
                          <span className="italic text-gray-500">N/A</span>
                        )}
                      </td>
                      {/* ⭐ New Term Data Cell ⭐ */}
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {student.currentTerm || (
                          <span className="italic text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{student.gender}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {student.enrolledCourses.length > 0
                          ? student.enrolledCourses.map((c) => (
                              <span key={c._id} className="inline-block bg-green-100 text-green-800 text-xs font-medium mr-1 mb-1 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {c.code}
                              </span>
                            ))
                          : <span className="italic text-gray-500">None</span>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {student.parent ? (
                          <span className="text-purple-700 font-medium">
                            {student.parent.firstName} {student.parent.lastName}
                          </span>
                        ) : (
                          <span className="italic text-gray-500">None</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEditStudentClick(student)}
                          className="inline-flex items-center px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-medium mr-2 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          title="Edit student"
                        >
                          <i className="fas fa-edit mr-1"></i> Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteStudent(student._id, `${student.user?.firstName || ''} ${student.user?.lastName || ''}`)
                          }
                          className="inline-flex items-center px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md font-medium disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          disabled={deleteLoading === student._id}
                          title="Delete student record"
                        >
                          {deleteLoading === student._id ? (
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                          ) : (
                            <i className="fas fa-trash-alt mr-1"></i>
                          )}
                          {deleteLoading === student._id ? 'Deleting...' : 'Delete'}
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

      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentToEdit={selectedStudent}
        onSave={handleSaveStudent}
        isTeacherView={false} // Ensure this is explicitly false for Admin view
      />
    </motion.div>
  );
};

export default AdminStudentsPage;