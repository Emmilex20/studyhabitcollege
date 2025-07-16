/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/modals/GradeFormModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Grade {
    _id: string;
    student: { _id: string; user: { _id: string; firstName: string; lastName: string; }; studentId: string; };
    course: { _id: string; name: string; code: string; };
    teacher: { _id: string; firstName: string; lastName: string; };
    gradeType: string;
    score: number;
    weight: number;
    term: string;
    academicYear: string;
    dateRecorded: string;
    remarks?: string;
}

interface StudentOption {
    _id: string;
    user: { _id: string; firstName: string; lastName: string; };
    studentId: string;
}

interface CourseOption {
    _id: string;
    name: string;
    code: string;
}

interface GradeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    gradeToEdit?: Grade | null; // Null for create, object for edit
    onSave: (grade: Grade) => void;
    isTeacherView?: boolean; // Added prop, though backend filtering makes it less critical here
}

const GradeFormModal: React.FC<GradeFormModalProps> = ({ isOpen, onClose, gradeToEdit, onSave }) => {
    const { userInfo } = useAuth();
    const [formData, setFormData] = useState({
        student: '',
        course: '',
        gradeType: '',
        score: '', // Use string for input to handle empty state
        weight: '', // Use string for input
        term: '',
        academicYear: '',
        remarks: '',
    });
    const [students, setStudents] = useState<StudentOption[]>([]);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [loadingDependencies, setLoadingDependencies] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const gradeTypes = ['Test', 'Exam', 'Quiz', 'Assignment', 'Project', 'Midterm', 'Final'];
    const terms = ['First Term', 'Second Term', 'Third Term', 'Semester 1', 'Semester 2', 'Annual'];
    const currentYear = new Date().getFullYear();
    const academicYears = Array.from({ length: 7 }, (_, i) => `${currentYear - 5 + i}/${currentYear - 4 + i}`);


    useEffect(() => {
        if (gradeToEdit) {
            setFormData({
                student: gradeToEdit.student._id,
                course: gradeToEdit.course._id,
                gradeType: gradeToEdit.gradeType,
                score: gradeToEdit.score.toString(),
                weight: gradeToEdit.weight.toString(),
                term: gradeToEdit.term,
                academicYear: gradeToEdit.academicYear,
                remarks: gradeToEdit.remarks || '',
            });
        } else {
            // Reset form for create mode
            setFormData({
                student: '',
                course: '',
                gradeType: '',
                score: '',
                weight: '',
                term: '',
                academicYear: '',
                remarks: '',
            });
        }
        setError(null);
    }, [gradeToEdit, isOpen]);

    useEffect(() => {
        const fetchDependencies = async () => {
            if (!userInfo?.token) {
                setError('User not authenticated.');
                setLoadingDependencies(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            try {
                setLoadingDependencies(true);
                // These API calls will automatically be filtered by the backend based on `userInfo.role`
                const { data: coursesData } = await axios.get('http://localhost:5000/api/courses', config);
                setCourses(coursesData);

                const { data: studentsData } = await axios.get('http://localhost:5000/api/students', config);
                setStudents(studentsData);

                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch dependencies for grades:", err);
                setError(err.response?.data?.message || "Failed to load students/courses.");
            } finally {
                setLoadingDependencies(false);
            }
        };
        if (isOpen) {
            fetchDependencies();
        }
    }, [isOpen, userInfo]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!userInfo?.token) {
            setError('User not authenticated.');
            setIsSubmitting(false);
            return;
        }

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json',
            },
        };

        try {
            let response;
            const payload = {
                ...formData,
                score: parseFloat(formData.score),
                weight: parseFloat(formData.weight || '1'),
            };

            if (gradeToEdit) {
                response = await axios.put(`http://localhost:5000/api/grades/${gradeToEdit._id}`, payload, config);
            } else {
                response = await axios.post('http://localhost:5000/api/grades', payload, config);
            }
            onSave(response.data);
            onClose();
        } catch (err: any) {
            console.error("Grade form submission error:", err);
            setError(err.response?.data?.message || 'Failed to save grade.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg my-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b pb-3">
                            {gradeToEdit ? 'Edit Grade' : 'Add New Grade'}
                        </h2>

                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        {loadingDependencies && <p className="text-gray-500 mb-4">Loading data...</p>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="student" className="block text-sm font-medium text-gray-700">Student</label>
                                <select
                                    id="student"
                                    name="student"
                                    value={formData.student}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                    disabled={gradeToEdit !== null || loadingDependencies}
                                >
                                    <option value="">Select Student</option>
                                    {students.map(student => (
                                        <option key={student._id} value={student._id}>
                                            {student.user.firstName} {student.user.lastName} ({student.studentId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course</label>
                                <select
                                    id="course"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                    disabled={gradeToEdit !== null || loadingDependencies}
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.name} ({course.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="gradeType" className="block text-sm font-medium text-gray-700">Grade Type</label>
                                <select
                                    id="gradeType"
                                    name="gradeType"
                                    value={formData.gradeType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                    disabled={gradeToEdit !== null}
                                >
                                    <option value="">Select Grade Type</option>
                                    {gradeTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="score" className="block text-sm font-medium text-gray-700">Score (0-100)</label>
                                <input
                                    type="number"
                                    id="score"
                                    name="score"
                                    value={formData.score}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (Optional, default 1)</label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.1"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="term" className="block text-sm font-medium text-gray-700">Term</label>
                                <select
                                    id="term"
                                    name="term"
                                    value={formData.term}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                    disabled={gradeToEdit !== null}
                                >
                                    <option value="">Select Term</option>
                                    {terms.map(term => (
                                        <option key={term} value={term}>{term}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">Academic Year</label>
                                <select
                                    id="academicYear"
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                    disabled={gradeToEdit !== null}
                                >
                                    <option value="">Select Academic Year</option>
                                    {academicYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
                                <textarea
                                    id="remarks"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    rows={2}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting || loadingDependencies}
                                >
                                    {isSubmitting ? 'Saving...' : (gradeToEdit ? 'Save Changes' : 'Add Grade')}
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