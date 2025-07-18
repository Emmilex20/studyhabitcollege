/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/TeacherGradebookPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // Added AnimatePresence, easeOut
import GradeFormModal from '../../components/modals/GradeFormModal';

// Updated Grade interface to match the one in GradeFormModal.tsx
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

const TeacherGradebookPage: React.FC = () => {
    const { userInfo } = useAuth();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    const fetchGrades = async () => {
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
            // Backend should filter grades to only those for courses taught by this teacher
            const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/grades', config);
            setGrades(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch grades. Please try again.');
            console.error('Error fetching grades:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrades();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo]); // Depend on userInfo to refetch if login state changes

    const handleAddGradeClick = () => {
        setSelectedGrade(null); // Clear selected grade for 'add' mode
        setIsModalOpen(true);
    };

    const handleEditGradeClick = (grade: Grade) => {
        setSelectedGrade(grade); // Set selected grade for 'edit' mode
        setIsModalOpen(true);
    };

    const handleSaveGrade = async () => {
        // Re-fetch all grades after save/update
        await fetchGrades();
    };

    const handleDeleteGrade = async (gradeId: string, studentName: string, courseName: string, gradeType: string) => {
        if (!userInfo?.token) {
            setError('User not authenticated.');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the ${gradeType} grade for ${studentName} in ${courseName}? This action cannot be undone.`)) {
            setDeleteLoading(gradeId);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                    withCredentials: true,
                };
                await axios.delete(`https://studyhabitcollege.onrender.com/api/grades/${gradeId}`, config);
                await fetchGrades(); // Re-fetch grades after successful deletion
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to delete grade.');
                console.error('Error deleting grade:', err);
            } finally {
                setDeleteLoading(null);
            }
        }
    };

    // Framer Motion Variants
    const pageVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
    };
  
    const tableRowVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.05, // Stagger effect
          duration: 0.3,
          ease: easeOut,
        },
      }),
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={pageVariants}
            className="teacher-gradebook-page p-4 sm:p-6 bg-gray-50 min-h-screen font-sans"
        >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-6 flex items-center">
                <i className="fas fa-chart-bar mr-3 text-indigo-600"></i> My Gradebook
            </h2>
            <p className="text-gray-700 mb-8 text-lg">
                Manage and view grades for students in your assigned courses. You can add, edit, or delete grade entries here. 📊
            </p>

            <button
                onClick={handleAddGradeClick}
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 flex items-center"
            >
                <i className="fas fa-plus mr-2"></i> Add New Grade
            </button>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="ml-4 text-lg text-gray-600">Loading gradebook... 🔄</p>
                </div>
            ) : error ? (
                <div className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
                    <p className="text-xl font-semibold mb-2 flex items-center justify-center">
                        <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Grades!
                    </p>
                    <p>{error}</p>
                    <p className="text-sm mt-3 text-red-500">Please ensure you are logged in as a teacher. ⚠️</p>
                </div>
            ) : grades.length === 0 ? (
                <div className="text-center py-10 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
                    <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
                        <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Grades Found!
                    </p>
                    <p className="text-gray-600">
                        It looks like there are no grade entries for your assigned courses yet. Click "Add New Grade" to get started!
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
                    <table className="min-w-full leading-normal divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Course
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Type / Assignment
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Max Score
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Weight (%)
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Term
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Academic Year
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date Graded
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <AnimatePresence>
                                {grades.map((grade, index) => (
                                    <motion.tr 
                                        key={grade._id}
                                        custom={index}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        variants={tableRowVariants}
                                        className="hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <i className="fas fa-user-graduate text-blue-500 mr-2"></i>
                                                <span className="font-medium">
                                                    {grade.student?.user?.firstName} {grade.student?.user?.lastName}
                                                </span>
                                                <span className="text-gray-500 ml-1">({grade.student?.studentId})</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <i className="fas fa-book-open text-purple-500 mr-2"></i>
                                                <span className="font-medium">
                                                    {grade.course?.name}
                                                </span>
                                                <span className="text-gray-500 ml-1">({grade.course?.code})</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-900">
                                            <span className="font-semibold text-indigo-700">{grade.gradeType}</span>
                                            {grade.assignmentName && (
                                                <p className="text-xs text-gray-500 italic mt-1">({grade.assignmentName})</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm">
                                            <span className="font-extrabold text-lg text-green-700">{grade.score}</span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {grade.maxScore}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {grade.weight}%
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{grade.term}</span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{grade.academicYear}</span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {new Date(grade.dateGraded).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleEditGradeClick(grade)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                                                title="Edit Grade"
                                            >
                                                <i className="fas fa-edit"></i> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGrade(grade._id, `${grade.student?.user?.firstName} ${grade.student?.user?.lastName}`, grade.course?.name || '', grade.gradeType)}
                                                className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                                                disabled={deleteLoading === grade._id}
                                                title="Delete Grade"
                                            >
                                                {deleteLoading === grade._id ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin mr-1"></i> Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-trash-alt"></i> Delete
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}

            <GradeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                gradeToEdit={selectedGrade}
                onSave={handleSaveGrade}
                isTeacherView={true} // Indicate this is for a teacher
            />
        </motion.div>
    );
};

export default TeacherGradebookPage;