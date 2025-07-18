/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/modals/CourseFormModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  yearLevel: string;
  // ✨ ADDED: academicYear and term properties
  academicYear?: string;
  term?: string;
  teacher?: { _id: string; firstName: string; lastName: string };
}

interface TeacherOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
  onSave: (course: Course) => void;
}

const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  onSave,
}) => {
  const { userInfo } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    yearLevel: '',
    academicYear: '', // ✨ ADDED: Initialize academicYear
    term: '',         // ✨ ADDED: Initialize term
    teacher: '',
  });
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define the academic years and terms. You can make this dynamic if needed.
  const academicYears = ['2023/2024', '2024/2025', '2025/2026', '2026/2027', '2027/2028'];
  const terms = ['First Term', 'Second Term', 'Third Term'];
  const yearLevels = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3', 'SSS1', 'SSS2', 'SSS3', 'Year 7', 'Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];


  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        name: courseToEdit.name,
        code: courseToEdit.code,
        description: courseToEdit.description || '',
        yearLevel: courseToEdit.yearLevel,
        academicYear: courseToEdit.academicYear || '', // ✨ ADDED: Populate from courseToEdit
        term: courseToEdit.term || '',                 // ✨ ADDED: Populate from courseToEdit
        teacher: courseToEdit.teacher?._id || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        yearLevel: '',
        academicYear: '',
        term: '',
        teacher: '',
      });
    }
    setError(null);
  }, [courseToEdit, isOpen]);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!userInfo?.token) return;

      try {
        setLoadingTeachers(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/users?role=teacher', config);
        setTeachers(data);
      } catch (err) {
        console.error('Failed to fetch teachers:', err);
      } finally {
        setLoadingTeachers(false);
      }
    };

    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen, userInfo?.token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
      const payload = {
        ...formData,
        teacher: formData.teacher === '' ? null : formData.teacher, // Handle unassigned teacher
        // academicYear and term are already in formData, so they are included here
      };

      let response;
      if (courseToEdit) {
        response = await axios.put(
          `https://studyhabitcollege.onrender.com/api/courses/${courseToEdit._id}`,
          payload,
          config
        );
      } else {
        response = await axios.post('https://studyhabitcollege.onrender.com/api/courses', payload, config);
      }

      onSave(response.data);
      onClose();
    } catch (err: any) {
      console.error('Course form submission error:', err);
      setError(err.response?.data?.message || 'Failed to save course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" // Added max-h and overflow for long forms
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b pb-3 flex items-center">
            <i className="fas fa-book mr-3 text-indigo-600"></i>
            {courseToEdit ? 'Edit Course' : 'Create New Course'}
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="yearLevel" className="block text-sm font-medium text-gray-700">
                Year Level <span className="text-red-500">*</span>
              </label>
              <select
                id="yearLevel"
                name="yearLevel"
                value={formData.yearLevel}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Select Year Level</option>
                {yearLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* ✨ ADDED: Academic Year Input */}
            <div>
              <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">
                Academic Year
              </label>
              <select
                id="academicYear"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* ✨ ADDED: Term Input */}
            <div>
              <label htmlFor="term" className="block text-sm font-medium text-gray-700">
                Term
              </label>
              <select
                id="term"
                name="term"
                value={formData.term}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Term</option>
                {terms.map(termOption => (
                  <option key={termOption} value={termOption}>{termOption}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">
                Assign Teacher (Optional)
              </label>
              <select
                id="teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={loadingTeachers}
              >
                <option value="">
                  {loadingTeachers ? 'Loading teachers...' : 'Select Teacher (Optional)'}
                </option>
                {teachers.map(teacher => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.firstName} {teacher.lastName} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>Saving...
                  </>
                ) : courseToEdit ? (
                  <>
                    <i className="fas fa-save mr-2"></i>Save Changes
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle mr-2"></i>Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CourseFormModal;