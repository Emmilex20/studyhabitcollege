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
    teacher: '',
  });
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        name: courseToEdit.name,
        code: courseToEdit.code,
        description: courseToEdit.description || '',
        yearLevel: courseToEdit.yearLevel,
        teacher: courseToEdit.teacher?._id || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        yearLevel: '',
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
  }, [isOpen, userInfo?.token]); // ✅ FIXED: avoid infinite fetch loop

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
        teacher: formData.teacher === '' ? null : formData.teacher,
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
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b pb-3">
            {courseToEdit ? 'Edit Course' : 'Create New Course'}
          </h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Course Name
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
                Course Code
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
                Year Level
              </label>
              <input
                type="text"
                id="yearLevel"
                name="yearLevel"
                value={formData.yearLevel}
                onChange={handleChange}
                placeholder="e.g., JSS1, SS2, Year 7"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : courseToEdit ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CourseFormModal;
