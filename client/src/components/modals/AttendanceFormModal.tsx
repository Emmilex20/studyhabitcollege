/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/modals/AttendanceFormModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Attendance {
    _id: string;
    student: { _id: string; user: { _id: string; firstName: string; lastName: string; }; studentId: string; };
    course?: { _id: string; name: string; code: string; };
    teacher?: { _id: string; firstName: string; lastName: string; };
    date: string; // ISO string
    status: string;
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

interface AttendanceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendanceToEdit?: Attendance | null; // Null for create, object for edit
    onSave: (attendance: Attendance) => void;
    isTeacherView?: boolean; // Added prop
}

const AttendanceFormModal: React.FC<AttendanceFormModalProps> = ({ isOpen, onClose, attendanceToEdit, onSave }) => {
    const { userInfo } = useAuth();
    const [formData, setFormData] = useState({
        student: '',
        course: '', // Can be empty for general attendance
        date: '',
        status: '',
        remarks: '',
    });
    const [students, setStudents] = useState<StudentOption[]>([]);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [loadingDependencies, setLoadingDependencies] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const attendanceStatuses = ['Present', 'Absent', 'Late', 'Excused'];

    useEffect(() => {
        if (attendanceToEdit) {
            setFormData({
                student: attendanceToEdit.student._id,
                course: attendanceToEdit.course?._id || '',
                date: attendanceToEdit.date.split('T')[0], // Format for input type="date"
                status: attendanceToEdit.status,
                remarks: attendanceToEdit.remarks || '',
            });
        } else {
            setFormData({
                student: '',
                course: '',
                date: '',
                status: '',
                remarks: '',
            });
        }
        setError(null);
    }, [attendanceToEdit, isOpen]);

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
                const { data: coursesData } = await axios.get('https://studyhabitcollege.onrender.com/api/courses', config);
                setCourses(coursesData);

                const { data: studentsData } = await axios.get('https://studyhabitcollege.onrender.com/api/students', config);
                setStudents(studentsData);

                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch dependencies for attendance:", err);
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
                course: formData.course === '' ? null : formData.course, // Send null if no course selected
                date: new Date(formData.date).toISOString(), // Convert date to ISO string
            };

            if (attendanceToEdit) {
                response = await axios.put(`https://studyhabitcollege.onrender.com/api/attendance/${attendanceToEdit._id}`, payload, config);
            } else {
                response = await axios.post('https://studyhabitcollege.onrender.com/api/attendance', payload, config);
            }
            onSave(response.data);
            onClose();
        } catch (err: any) {
            console.error("Attendance form submission error:", err);
            setError(err.response?.data?.message || 'Failed to save attendance record.');
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
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md my-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b pb-3">
                            {attendanceToEdit ? 'Edit Attendance Record' : 'Add New Attendance Record'}
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
                                    disabled={attendanceToEdit !== null || loadingDependencies}
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
                                <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course (Optional)</label>
                                <select
                                    id="course"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    disabled={attendanceToEdit !== null || loadingDependencies}
                                >
                                    <option value="">General Attendance (No Specific Course)</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.name} ({course.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                    disabled={attendanceToEdit !== null}
                                />
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Select Status</option>
                                    {attendanceStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
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
                                    {isSubmitting ? 'Saving...' : (attendanceToEdit ? 'Save Changes' : 'Add Record')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AttendanceFormModal;