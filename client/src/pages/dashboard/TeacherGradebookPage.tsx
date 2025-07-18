/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/TeacherGradebookPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, easeOut } from 'framer-motion';
import GradeFormModal from '../../components/modals/GradeFormModal';

// Updated Grade interface (as above, with category)
interface Grade {
    _id: string;
    student: { _id: string; user: { _id: string; firstName: string; lastName: string; }; studentId: string; };
    course: { _id: string; name: string; code: string; };
    teacher: { _id: string; firstName: string; lastName: string; };
    gradeType: string;
    assignmentName?: string;
    category?: string; // ✨ Added category
    score: number;
    maxScore: number;
    weight: number;
    term: string;
    academicYear: string;
    dateGraded: string;
    remarks?: string;
}

// Interface for grouped grades
interface GroupedGrades {
    [courseId: string]: {
        courseInfo: { _id: string; name: string; code: string; };
        grades: Grade[];
    };
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
                withCredentials: true,
            };
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
    }, [userInfo]);

    // Group grades by course and then sort grades within each group by score (descending)
    const groupedGrades = useMemo(() => {
        const groups: GroupedGrades = {};
        grades.forEach(grade => {
            if (grade.course) {
                if (!groups[grade.course._id]) {
                    groups[grade.course._id] = {
                        courseInfo: grade.course,
                        grades: []
                    };
                }
                groups[grade.course._id].grades.push(grade);
            }
        });

        // Sort grades within each group by score in descending order
        for (const courseId in groups) {
            groups[courseId].grades.sort((a, b) => b.score - a.score);
        }

        return groups;
    }, [grades]);

    const handleAddGradeClick = () => {
        setSelectedGrade(null);
        setIsModalOpen(true);
    };

    const handleEditGradeClick = (grade: Grade) => {
        setSelectedGrade(grade);
        setIsModalOpen(true);
    };

    const handleSaveGrade = async () => {
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
                await fetchGrades();
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

    const courseSectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: easeOut
            }
        },
    };

    const tableRowVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.05,
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
            ) : Object.keys(groupedGrades).length === 0 ? (
                <div className="text-center py-10 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
                    <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
                        <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Grades Found!
                    </p>
                    <p className="text-gray-600">
                        It looks like there are no grade entries for your assigned courses yet. Click "Add New Grade" to get started!
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    <AnimatePresence>
                        {Object.values(groupedGrades).map((group, groupIndex) => (
                            <motion.div
                                key={group.courseInfo._id}
                                variants={courseSectionVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                transition={{ delay: groupIndex * 0.1 }}
                                className="bg-white rounded-lg shadow-xl border border-gray-200 p-6"
                            >
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                    <i className="fas fa-chalkboard-teacher mr-3 text-green-600"></i>
                                    {group.courseInfo.name} ({group.courseInfo.code})
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full leading-normal divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Student
                                                </th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Type / Assignment / Category {/* ✨ Updated Table Header */}
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
                                            {group.grades.map((grade, index) => (
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
                                                    <td className="px-5 py-4 text-sm text-gray-900">
                                                        <span className="font-semibold text-indigo-700">{grade.gradeType}</span>
                                                        {grade.assignmentName && (
                                                            <p className="text-xs text-gray-500 italic mt-1">({grade.assignmentName})</p>
                                                        )}
                                                        {/* ✨ NEW: Display category if available */}
                                                        {grade.category && (
                                                            <p className="text-xs text-purple-600 font-medium mt-1">
                                                                Category: {grade.category}
                                                            </p>
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
                                        </tbody>
                                    </table>
                                </div>
                                {group.grades.length === 0 && (
                                    <p className="text-center text-gray-500 mt-4">No grades recorded for this course yet.</p>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <GradeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                gradeToEdit={selectedGrade}
                onSave={handleSaveGrade}
                isTeacherView={true}
            />
        </motion.div>
    );
};

export default TeacherGradebookPage;