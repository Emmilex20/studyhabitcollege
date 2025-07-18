/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/modals/GradeFormModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

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

interface User {
    _id: string;
    firstName: string;
    lastName: string;
}

interface Student {
    _id: string;
    user: User;
    studentId: string;
}

interface Course {
    _id: string;
    name: string;
    code: string;
    teacher: string; // Assuming teacher ID for course
}

interface GradeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    gradeToEdit: Grade | null;
    onSave: () => void;
    isTeacherView?: boolean;
}

// Define the mapping for grade types and their associated assignment names
const gradeTypeAssignments: { [key: string]: string[] } = {
    'Quiz': ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Midterm Quiz', 'Final Quiz'],
    'Exam': ['Midterm Exam', 'Final Exam', 'Practical Exam'],
    'Homework': ['Homework 1', 'Homework 2', 'Homework 3', 'Project Assignment'],
    'Classwork': ['Participation', 'In-Class Activity', 'Daily Work'],
    'Project': ['Individual Project', 'Group Project', 'Capstone Project'],
    // Add other grade types and their assignments as needed
};

// All possible grade types for the initial dropdown
const allGradeTypes = Object.keys(gradeTypeAssignments);


const GradeFormModal: React.FC<GradeFormModalProps> = ({ isOpen, onClose, gradeToEdit, onSave, isTeacherView }) => {
    const { userInfo } = useAuth();
    const [formData, setFormData] = useState({
        student: '',
        course: '',
        gradeType: '',
        assignmentName: '',
        score: '',
        maxScore: '',
        weight: '',
        term: '',
        academicYear: '',
        dateGraded: new Date().toISOString().split('T')[0],
        remarks: '',
    });
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // State to hold the available assignment names based on selected gradeType
    const [availableAssignmentNames, setAvailableAssignmentNames] = useState<string[]>([]);

    // Use useCallback for fetchStudentsAndCourses to stabilize its reference
    const fetchStudentsAndCourses = useCallback(async () => {
        // Null check for userInfo and userInfo.token
        if (!userInfo || !userInfo.token) {
            setError('Authentication token not found or user not logged in.');
            setLoading(false); // Ensure loading is set to false if we return early
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

            // Fetch students
            const studentsRes = await axios.get('https://studyhabitcollege.onrender.com/api/students', config);
            setStudents(studentsRes.data);

            // Fetch courses (only those taught by the current teacher if isTeacherView is true)
            const coursesRes = await axios.get('https://studyhabitcollege.onrender.com/api/courses', config);
            if (isTeacherView && userInfo._id) {
                setCourses(coursesRes.data.filter((course: Course) => course.teacher === userInfo._id));
            } else {
                setCourses(coursesRes.data);
            }

            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data.');
            setLoading(false);
            console.error('Error fetching students or courses:', err);
        }
    }, [userInfo, isTeacherView]); // Add userInfo to dependency array

    useEffect(() => {
        if (isOpen) {
            fetchStudentsAndCourses();
            if (gradeToEdit) {
                setFormData({
                    student: gradeToEdit.student?._id || '',
                    course: gradeToEdit.course?._id || '',
                    gradeType: gradeToEdit.gradeType || '',
                    assignmentName: gradeToEdit.assignmentName || '',
                    score: gradeToEdit.score.toString(),
                    maxScore: gradeToEdit.maxScore.toString(),
                    weight: gradeToEdit.weight.toString(),
                    term: gradeToEdit.term || '',
                    academicYear: gradeToEdit.academicYear || '',
                    dateGraded: new Date(gradeToEdit.dateGraded).toISOString().split('T')[0],
                    remarks: gradeToEdit.remarks || '',
                });
                setAvailableAssignmentNames(gradeTypeAssignments[gradeToEdit.gradeType] || []);
            } else {
                setFormData({
                    student: '',
                    course: '',
                    gradeType: '',
                    assignmentName: '',
                    score: '',
                    maxScore: '',
                    weight: '',
                    term: '',
                    academicYear: '',
                    dateGraded: new Date().toISOString().split('T')[0],
                    remarks: '',
                });
                setAvailableAssignmentNames([]);
            }
            setError(null);
            setSuccessMessage(null);
        }
    }, [isOpen, gradeToEdit, fetchStudentsAndCourses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'gradeType') {
            setAvailableAssignmentNames(gradeTypeAssignments[value] || []);
            setFormData(prev => ({ ...prev, assignmentName: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Null check for userInfo and userInfo.token
        if (!userInfo || !userInfo.token) {
            setError('Authentication token not found or user not logged in.');
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            };

            const gradeData = {
                ...formData,
                score: parseFloat(formData.score),
                maxScore: parseFloat(formData.maxScore),
                weight: parseFloat(formData.weight),
                teacher: userInfo._id,
            };

            if (gradeToEdit) {
                await axios.put(`https://studyhabitcollege.onrender.com/api/grades/${gradeToEdit._id}`, gradeData, config);
                setSuccessMessage('Grade updated successfully!');
            } else {
                await axios.post('https://studyhabitcollege.onrender.com/api/grades', gradeData, config);
                setSuccessMessage('Grade added successfully!');
            }
            onSave();
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save grade. Please check your inputs.');
            console.error('Error saving grade:', err);
        } finally {
            setLoading(false);
        }
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: -50 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2, ease: 'easeIn' } },
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                            {gradeToEdit ? 'Edit Grade' : 'Add New Grade'}
                        </h2>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline"> {error}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Success!</strong>
                                <span className="block sm:inline"> {successMessage}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                                <select
                                    id="student"
                                    name="student"
                                    value={formData.student}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                    disabled={loading || !students.length}
                                >
                                    <option value="">Select Student</option>
                                    {loading ? (
                                        <option disabled>Loading students...</option>
                                    ) : (
                                        students.map(student => (
                                            <option key={student._id} value={student._id}>
                                                {student.user.firstName} {student.user.lastName} ({student.studentId})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                                <select
                                    id="course"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                    disabled={loading || !courses.length}
                                >
                                    <option value="">Select Course</option>
                                    {loading ? (
                                        <option disabled>Loading courses...</option>
                                    ) : (
                                        courses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.name} ({course.code})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="gradeType" className="block text-sm font-medium text-gray-700 mb-1">Grade Type</label>
                                <select
                                    id="gradeType"
                                    name="gradeType"
                                    value={formData.gradeType}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                >
                                    <option value="">Select Grade Type</option>
                                    {allGradeTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.gradeType && availableAssignmentNames.length > 0 && (
                                <div>
                                    <label htmlFor="assignmentName" className="block text-sm font-medium text-gray-700 mb-1">Assignment Name</label>
                                    <select
                                        id="assignmentName"
                                        name="assignmentName"
                                        value={formData.assignmentName}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                    >
                                        <option value="">Select Assignment (Optional)</option>
                                        {availableAssignmentNames.map(assignment => (
                                            <option key={assignment} value={assignment}>{assignment}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.gradeType && availableAssignmentNames.length === 0 && (
                                <div>
                                    <label htmlFor="assignmentName" className="block text-sm font-medium text-gray-700 mb-1">Assignment Name (Optional)</label>
                                    <input
                                        type="text"
                                        id="assignmentName"
                                        name="assignmentName"
                                        value={formData.assignmentName}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                        placeholder="e.g., Pop Quiz 1"
                                    />
                                </div>
                            )}


                            <div>
                                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                                <input
                                    type="number"
                                    id="score"
                                    name="score"
                                    value={formData.score}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.1"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                />
                            </div>

                            <div>
                                <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                                <input
                                    type="number"
                                    id="maxScore"
                                    name="maxScore"
                                    value={formData.maxScore}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    step="0.1"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                />
                            </div>

                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                />
                            </div>

                            <div>
                                <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                                <select
                                    id="term"
                                    name="term"
                                    value={formData.term}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                >
                                    <option value="">Select Term</option>
                                    <option value="First Term">First Term</option>
                                    <option value="Second Term">Second Term</option>
                                    <option value="Third Term">Third Term</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                                <input
                                    type="text"
                                    id="academicYear"
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., 2024/2025"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                />
                            </div>

                            <div>
                                <label htmlFor="dateGraded" className="block text-sm font-medium text-gray-700 mb-1">Date Graded</label>
                                <input
                                    type="date"
                                    id="dateGraded"
                                    name="dateGraded"
                                    value={formData.dateGraded}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                                <textarea
                                    id="remarks"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                                    placeholder="Any additional notes about the grade..."
                                ></textarea>
                            </div>

                            <div className="col-span-1 md:col-span-2 flex justify-end space-x-3 mt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <i className="fas fa-spinner fa-spin mr-2"></i> Saving...
                                        </span>
                                    ) : (
                                        gradeToEdit ? 'Update Grade' : 'Add Grade'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GradeFormModal;