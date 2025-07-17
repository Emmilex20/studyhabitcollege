/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/TeacherGradebookPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import GradeFormModal from '../../components/modals/GradeFormModal';

// Updated Grade interface to match the one in GradeFormModal.tsx
interface Grade {
    _id: string;
    student: { _id: string; user: { _id: string; firstName: string; lastName: string; }; studentId: string; };
    course: { _id: string; name: string; code: string; };
    teacher: { _id: string; firstName: string; lastName: string; };
    gradeType: string;
    assignmentName?: string; // Add this if your backend schema includes it as optional
    score: number;
    maxScore: number; // ✨ ADDED: maxScore property ✨
    weight: number;
    term: string;
    academicYear: string;
    dateGraded: string; // ✨ CHANGED: from dateRecorded to dateGraded ✨
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
            };
            // Backend should filter grades to only those for courses taught by this teacher
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
        if (window.confirm(`Are you sure you want to delete the ${gradeType} grade for ${studentName} in ${courseName}?`)) {
            setDeleteLoading(gradeId);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                await axios.delete(`https://studyhabitcollege.onrender.com/api/grades/${gradeId}`, config);
                await fetchGrades(); // Re-fetch grades after successful deletion
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to delete grade.');
                console.error(err);
            } finally {
                setDeleteLoading(null);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-10 text-gray-600">Loading gradebook...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">{error}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="teacher-gradebook-page p-6" // Added padding for better spacing
        >
            <h2 className="text-3xl font-bold text-blue-800 mb-6">My Gradebook</h2>
            <p className="text-gray-700 mb-4">View and manage grades for students in your assigned courses. ✨</p>

            <button
                onClick={handleAddGradeClick}
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center" // Added flex for icon
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
                                Type
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Score
                            </th>
                            {/* Display Max Score */}
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Max Score
                            </th>
                            {/* Display Weight */}
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Weight
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Term
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Academic Year
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Date Graded {/* Changed column header */}
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {grades.length === 0 && !loading ? (
                            <tr>
                                <td colSpan={10} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center text-gray-500">
                                    No grades found for your courses.
                                </td>
                            </tr>
                        ) : (
                            grades.map((grade) => (
                                <tr key={grade._id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {grade.student?.user?.firstName} {grade.student?.user?.lastName} ({grade.student?.studentId})
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {grade.course?.name} ({grade.course?.code})
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {grade.gradeType}
                                        {grade.assignmentName && <p className="text-xs text-gray-500 italic">({grade.assignmentName})</p>}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className="font-bold text-blue-700">{grade.score}</span>
                                    </td>
                                    {/* Display maxScore */}
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {grade.maxScore}
                                    </td>
                                    {/* Display weight */}
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {grade.weight}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {grade.term}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {grade.academicYear}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {new Date(grade.dateGraded).toLocaleDateString()} {/* Use dateGraded */}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <button
                                            onClick={() => handleEditGradeClick(grade)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGrade(grade._id, `${grade.student?.user?.firstName} ${grade.student?.user?.lastName}`, grade.course?.name || '', grade.gradeType)}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={deleteLoading === grade._id}
                                        >
                                            {deleteLoading === grade._id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

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