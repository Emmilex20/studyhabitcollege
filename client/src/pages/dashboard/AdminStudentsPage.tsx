/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminStudentsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import StudentFormModal from '../../components/modals/StudentFormModal';

interface Student {
  _id: string;
  user: { _id: string; firstName: string; lastName: string; email: string };
  studentId: string;
  dateOfBirth: string;
  gender: string;
  currentClass?: string;
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

  const fetchStudents = useCallback(async () => {
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
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/students', config);
      setStudents(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudentClick = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async () => {
    await fetchStudents();
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete student: ${studentName}? This will also delete their student record, but not their user account.`
      )
    ) {
      setDeleteLoading(studentId);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/students/${studentId}`, config);
        await fetchStudents();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete student record.');
        console.error(err);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading students...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="admin-students-page"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Manage Students</h2>
      <p className="text-gray-700 mb-4">Here you can add, edit, or delete student records.</p>

      <button
        onClick={handleAddStudentClick}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <i className="fas fa-plus mr-2"></i> Add New Student
      </button>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              {['Student ID', 'Name', 'Email', 'Class', 'Gender', 'Courses', 'Parent', 'Actions'].map((title) => (
                <th
                  key={title}
                  className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{student.studentId}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {student.user?.firstName} {student.user?.lastName}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{student.user?.email}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {student.currentClass || 'N/A'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{student.gender}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {student.enrolledCourses.length > 0
                    ? student.enrolledCourses.map((c) => c.code).join(', ')
                    : 'None'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {student.parent ? `${student.parent.firstName} ${student.parent.lastName}` : 'None'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button
                    onClick={() => handleEditStudentClick(student)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteStudent(student._id, `${student.user.firstName} ${student.user.lastName}`)
                    }
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={deleteLoading === student._id}
                  >
                    {deleteLoading === student._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500 mt-4">No student records found. Add a new student!</p>
      )}

      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentToEdit={selectedStudent}
        onSave={handleSaveStudent}
        isTeacherView={false}
      />
    </motion.div>
  );
};

export default AdminStudentsPage;
