/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/modals/CourseFormModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Corrected path based on typical structure
// 🎯 IMPORT Course interface from the centralized types file
import type { Course } from '../../types'; // ADJUST PATH if your src/types is in a different location relative to this file

// Keep these interfaces here if they are only used within this file
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
  courseToEdit?: Course | null; // This type is correct for the prop
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
    yearLevel: [] as string[],
    academicYear: '',
    term: [] as string[], // Initialize as empty array
    teacher: '',
  });

  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  // State for dynamic data fetched from backend
  const [dynamicAcademicYears, setDynamicAcademicYears] = useState<string[]>([]);
  const [dynamicTerms, setDynamicTerms] = useState<string[]>([]);
  const [dynamicYearLevels, setDynamicYearLevels] = useState<string[]>([]);

  const [loadingDynamicData, setLoadingDynamicData] = useState(true); // Combined loading for all dynamic data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to populate form when editing an existing course or resetting for a new one
  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        name: courseToEdit.name,
        code: courseToEdit.code,
        description: courseToEdit.description || '',
        // Ensure yearLevel is an array. Use `|| []` to handle potential undefined
        yearLevel: courseToEdit.yearLevel || [],
        academicYear: courseToEdit.academicYear || '',
        // Ensure term is an array. Use `|| []` to handle potential undefined
        term: courseToEdit.term || [], // 🎯 Correctly handle `undefined` from `courseToEdit.term`
        teacher: courseToEdit.teacher?._id || '',
      });
    } else {
      // Reset form for new course creation
      setFormData({
        name: '',
        code: '',
        description: '',
        yearLevel: [],
        academicYear: '',
        term: [],
        teacher: '',
      });
    }
    setError(null); // Clear any previous errors
  }, [courseToEdit, isOpen]);

  // Effect to fetch dynamic data (teachers, academic years, terms, year levels)
  useEffect(() => {
    const fetchData = async () => {
      if (!userInfo?.token) {
        setError('User not authenticated. Please log in.');
        return;
      }

      setLoadingDynamicData(true);
      setError(null); // Clear previous errors before fetching

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      try {
        // Fetch Teachers
        const teachersResponse = await axios.get('https://studyhabitcollege.onrender.com/api/users?role=teacher', config);
        setTeachers(teachersResponse.data);

        // Fetch Academic Years
        const academicYearsResponse = await axios.get('https://studyhabitcollege.onrender.com/api/settings/academic-years', config);
        // 🎯 Access the 'academicYears' property from the response data object
        setDynamicAcademicYears(academicYearsResponse.data.academicYears);

        // Fetch Terms
        const termsResponse = await axios.get('https://studyhabitcollege.onrender.com/api/settings/terms', config);
        // 🎯 Access the 'terms' property from the response data object
        setDynamicTerms(termsResponse.data.terms);

        // Fetch Year Levels
        const yearLevelsResponse = await axios.get('https://studyhabitcollege.onrender.com/api/settings/year-levels', config);
        // 🎯 Access the 'yearLevels' property from the response data object
        setDynamicYearLevels(yearLevelsResponse.data.yearLevels);

      } catch (err: any) {
        console.error('Failed to fetch dynamic data:', err);
        setError(err.response?.data?.message || 'Failed to load options (academic years, terms, year levels, or teachers). Please try again.');
        // Optionally, reset dynamic data if fetch fails
        setTeachers([]);
        setDynamicAcademicYears([]);
        setDynamicTerms([]);
        setDynamicYearLevels([]);
      } finally {
        setLoadingDynamicData(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, userInfo?.token]); // Re-run when modal opens or token changes

  // Handles changes for all input types, including multi-selects
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    if (e.target instanceof HTMLSelectElement && e.target.multiple) {
      // For multi-selects, get all selected options' values
      const value = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      // For single inputs/selects
      const { value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
      };

      let response;
      if (courseToEdit) {
        // PUT request for updating
        response = await axios.put(
          `https://studyhabitcollege.onrender.com/api/courses/${courseToEdit._id}`,
          payload,
          config
        );
      } else {
        // POST request for creating
        response = await axios.post('https://studyhabitcollege.onrender.com/api/courses', payload, config);
      }

      onSave(response.data); // Notify parent component of successful save
      onClose(); // Close the modal
    } catch (err: any) {
      console.error('Course form submission error:', err);
      setError(err.response?.data?.message || 'Failed to save course. Please check your input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only render the modal if it's open
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
        onClick={onClose} // Close modal when clicking outside
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal content
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b pb-3 flex items-center">
            <i className="fas fa-book mr-3 text-indigo-600"></i>
            {courseToEdit ? 'Edit Course' : 'Create New Course'}
          </h2>

          {/* Error and Loading Message Display */}
          {(error || loadingDynamicData) && (
            <div className={`
              ${error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-blue-100 border-blue-400 text-blue-700'}
              px-4 py-3 rounded relative mb-4
            `} role="alert">
              <strong className="font-bold">{error ? 'Error!' : 'Loading Options!'}</strong>
              <span className="block sm:inline ml-2">
                {error || 'Fetching academic years, terms, year levels, and teachers...'}
                {loadingDynamicData && <i className="fas fa-spinner fa-spin ml-2"></i>}
              </span>
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

            {/* Year Level - Dynamic and Multi-select */}
            <div>
              <label htmlFor="yearLevel" className="block text-sm font-medium text-gray-700">
                Year Level(s) <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(Ctrl/Cmd + click to select multiple)</span>
              </label>
              <select
                id="yearLevel"
                name="yearLevel"
                multiple
                value={formData.yearLevel}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-32"
                required
                disabled={loadingDynamicData}
              >
                {loadingDynamicData && <option value="" disabled>Loading year levels...</option>}
                {/* 🎯 Updated line: Check length with optional chaining */}
                {!loadingDynamicData && dynamicYearLevels?.length === 0 && <option value="" disabled>No year levels available</option>}
                {/* Ensure map also uses optional chaining */}
                {dynamicYearLevels?.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Academic Year Input - Dynamic and Single-select */}
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
                disabled={loadingDynamicData}
              >
                {loadingDynamicData && <option value="" disabled>Loading academic years...</option>}
                <option value="">Select Academic Year</option> {/* Keep for single select, allows no selection */}
                {/* 🎯 Updated line: Check length with optional chaining */}
                {!loadingDynamicData && dynamicAcademicYears?.length === 0 && <option value="" disabled>No academic years available</option>}
                {/* Ensure map also uses optional chaining */}
                {dynamicAcademicYears?.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Term - Dynamic and Multi-select */}
            <div>
              <label htmlFor="term" className="block text-sm font-medium text-gray-700">
                Term(s) <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(Ctrl/Cmd + click to select multiple)</span>
              </label>
              <select
                id="term"
                name="term"
                multiple
                value={formData.term}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-24"
                required
                disabled={loadingDynamicData}
              >
                {loadingDynamicData && <option value="" disabled>Loading terms...</option>}
                {/* 🎯 Updated line: Check length with optional chaining */}
                {!loadingDynamicData && dynamicTerms?.length === 0 && <option value="" disabled>No terms available</option>}
                {/* Ensure map also uses optional chaining */}
                {dynamicTerms?.map(termOption => (
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
                disabled={loadingDynamicData} // Disable if any dynamic data is loading
              >
                {loadingDynamicData && <option value="" disabled>Loading teachers...</option>}
                <option value="">Select Teacher (Optional)</option>
                {/* 🎯 Updated line: Check length with optional chaining */}
                {!loadingDynamicData && teachers?.length === 0 && <option value="" disabled>No teachers available</option>}
                {/* Ensure map also uses optional chaining */}
                {teachers?.map(teacher => (
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
                disabled={isSubmitting} // Disable cancel button during submission
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                // Made these conditions more robust by ensuring the arrays are not undefined first
                disabled={isSubmitting || loadingDynamicData || (dynamicYearLevels?.length === 0 || formData.yearLevel?.length === 0 || formData.term?.length === 0)}
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