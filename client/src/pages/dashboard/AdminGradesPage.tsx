/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminGradesPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import GradeFormModal from '../../components/modals/GradeFormModal';

interface Grade {
  _id: string;
  student: { _id: string; user: { _id: string; firstName: string; lastName: string; }; studentId: string; };
  course: { _id: string; name: string; code: string; };
  teacher: { _id: string; firstName: string; lastName: string; };
  gradeType: string;
  assignmentName?: string; // Add this if it's in your Grade model
  score: number;
  maxScore: number; // <-- ADDED
  weight: number;
  term: string;
  academicYear: string;
  dateGraded: string; // <-- RENAMED
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

  const fetchGrades = async () => {
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
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/grades', config);
      setGrades(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch grades.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [userInfo]);

  const handleAddGradeClick = () => {
    setSelectedGrade(null); // Clear selection for create mode
    setIsModalOpen(true);
  };

  const handleEditGradeClick = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsModalOpen(true);
  };

  const handleSaveGrade = async () => {
    await fetchGrades(); // Re-fetch all grades
  };

  const handleDeleteGrade = async (gradeId: string, studentName: string, courseName: string, gradeType: string, assignmentName?: string) => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
      return;
    }

    let confirmMessage = `Are you sure you want to delete the ${gradeType}`;
    if (assignmentName) {
      confirmMessage += ` "${assignmentName}"`;
    }
    confirmMessage += ` grade for ${studentName} in ${courseName}?`;

    if (window.confirm(confirmMessage)) {
      setDeleteLoading(gradeId);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/grades/${gradeId}`, config);
        await fetchGrades();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete grade.');
        console.error(err);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading grades...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="admin-grades-page"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Manage Grades</h2>
      <p className="text-gray-700 mb-4">Oversee and manage all student grades across courses.</p>

      <button
        onClick={handleAddGradeClick}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <i className="fas fa-plus mr-2"></i> Add New Grade
      </button>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Student
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Course
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type & Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Score
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Term
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Academic Year
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Recorded By
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date Graded
              </th> {/* <-- RENAMED */}
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {grade.student?.user?.firstName} {grade.student?.user?.lastName} ({grade.student?.studentId})
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {grade.course?.name} ({grade.course?.code})
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {grade.gradeType}
                  {grade.assignmentName && <span className="block text-xs text-gray-500 italic">({grade.assignmentName})</span>} {/* Display assignment name */}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className="font-bold text-blue-700">{grade.score}</span> / {grade.maxScore} {/* Display maxScore */}
                  {grade.remarks && <p className="text-xs text-gray-500 italic">{grade.remarks}</p>}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {grade.term}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {grade.academicYear}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {grade.teacher?.firstName} {grade.teacher?.lastName}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {new Date(grade.dateGraded).toLocaleDateString()} {/* <-- Display dateGraded */}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button
                    onClick={() => handleEditGradeClick(grade)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGrade(
                        grade._id,
                        `${grade.student?.user?.firstName} ${grade.student?.user?.lastName}`,
                        grade.course?.name || '',
                        grade.gradeType,
                        grade.assignmentName // Pass assignmentName
                    )}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={deleteLoading === grade._id}
                  >
                    {deleteLoading === grade._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {grades.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500 mt-4">No grades found. Add a new grade!</p>
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