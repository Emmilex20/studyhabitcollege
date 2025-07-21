/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/modals/StudentFormModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// --- Interfaces ---
interface Student {
  _id: string;
  user: { _id: string; firstName: string; lastName: string; email: string };
  studentId: string;
  dateOfBirth: string;
  gender: string;
  currentClass?: string;
  // ⭐ Add currentTerm to the Student interface ⭐
  currentTerm?: string;
  enrolledCourses: { _id: string; name: string; code: string }[];
  parent?: { _id: string; firstName: string; lastName: string; email: string };
}

interface UserOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface CourseOption {
  _id: string;
  name: string;
  code: string;
}

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null; // Student object when editing
  onSave: (student: Student) => void; // Callback after successful save
  isTeacherView: boolean; // Indicates if the modal is opened from the teacher dashboard
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  onSave,
}) => {
  const { userInfo } = useAuth();
  const [formData, setFormData] = useState({
    userId: '', // For associating with an existing user (admin add)
    studentId: '',
    dateOfBirth: '',
    gender: '',
    currentClass: '',
    // ⭐ Add currentTerm to the formData state ⭐
    currentTerm: '',
    enrolledCourses: [] as string[], // Array of course IDs
    parentId: '', // For associating with an existing parent user
  });
  const [studentUsers, setStudentUsers] = useState<UserOption[]>([]); // Available student users for association
  const [parentUsers, setParentUsers] = useState<UserOption[]>([]); // Available parent users for association
  const [allCourses, setAllCourses] = useState<CourseOption[]>([]); // All available courses
  const [loadingDependencies, setLoadingDependencies] = useState(true); // Loading state for initial data fetch
  const [isSubmitting, setIsSubmitting] = useState(false); // Submitting state for form
  const [error, setError] = useState<string | null>(null); // Error message state

  // --- Effects ---

  // Effect to populate form data when editing an existing student or reset for new student
  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        userId: studentToEdit.user._id,
        studentId: studentToEdit.studentId,
        dateOfBirth: studentToEdit.dateOfBirth.split('T')[0], // Format for HTML date input
        gender: studentToEdit.gender,
        currentClass: studentToEdit.currentClass || '',
        // ⭐ Populate currentTerm when editing ⭐
        currentTerm: studentToEdit.currentTerm || '',
        enrolledCourses: studentToEdit.enrolledCourses.map((c) => c._id),
        parentId: studentToEdit.parent?._id || '',
      });
    } else {
      // Reset form for adding new student
      setFormData({
        userId: '',
        studentId: '',
        dateOfBirth: '',
        gender: '',
        currentClass: '',
        // ⭐ Reset currentTerm for new student ⭐
        currentTerm: '',
        enrolledCourses: [],
        parentId: '',
      });
    }
    setError(null); // Clear any previous errors
  }, [studentToEdit, isOpen]); // Re-run when editing student changes or modal opens/closes

  // Effect to fetch available student users, parent users, and courses
  useEffect(() => {
    const fetchDependencies = async () => {
      if (!userInfo?.token) {
        setError('User not authenticated. Please log in.');
        setLoadingDependencies(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      try {
        setLoadingDependencies(true);

        const { data: usersData } = await axios.get(
          'https://studyhabitcollege.onrender.com/api/users',
          config
        );
        // Filter users based on their roles
        setStudentUsers(usersData.filter((u: UserOption) => u.role === 'student'));
        setParentUsers(usersData.filter((u: UserOption) => u.role === 'parent'));

        const { data: coursesData } = await axios.get(
          'https://studyhabitcollege.onrender.com/api/courses',
          config
        );
        setAllCourses(coursesData);
        setError(null); // Clear errors if fetch is successful
      } catch (err: any) {
        console.error('Failed to fetch dependencies (users/courses):', err);
        setError(
          err.response?.data?.message || 'Failed to load necessary data. Please try again.'
        );
      } finally {
        setLoadingDependencies(false);
      }
    };

    if (isOpen) { // Only fetch when the modal is open
      fetchDependencies();
    }
  }, [isOpen, userInfo?.token]); // Depend on isOpen and userInfo.token

  // --- Handlers ---

  // Handle changes for text and select inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes for the multi-select courses input
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, enrolledCourses: options }));
  };

  // Handle form submission (create or update student)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!userInfo?.token) {
      setError('Authentication required to save student data.');
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
      const payload: any = {
        studentId: formData.studentId,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(), // Ensure ISO string format
        gender: formData.gender,
        currentClass: formData.currentClass || undefined, // Send undefined if empty to avoid empty string
        // ⭐ Include currentTerm in the payload ⭐
        currentTerm: formData.currentTerm || undefined, // Send undefined if empty
        enrolledCourses: formData.enrolledCourses,
        parentId: formData.parentId === '' ? null : formData.parentId, // Send null if no parent selected
      };

      if (!studentToEdit) { // Only when creating a new student record
        if (!formData.userId) {
          setError('Please select an associated student user.');
          setIsSubmitting(false);
          return;
        }
        payload.userId = formData.userId;
      } else { // When editing, ensure the existing userId is sent back
        payload.userId = studentToEdit.user._id;
      }

      if (studentToEdit) {
        // Update existing student record
        response = await axios.put(
          `https://studyhabitcollege.onrender.com/api/students/${studentToEdit._id}`,
          payload,
          config
        );
      } else {
        // Create new student record
        response = await axios.post(
          'https://studyhabitcollege.onrender.com/api/students',
          payload,
          config
        );
      }

      onSave(response.data); // Call onSave with the updated/created student data
      onClose(); // Close modal on success
    } catch (err: any) {
      console.error('Student form submission error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to save student record. Please check your inputs.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---
  if (!isOpen) return null; // Don't render anything if modal is not open

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={onClose} // Close modal when clicking outside
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg my-8"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
            <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b pb-3">
              {studentToEdit ? 'Edit Student Record' : 'Create New Student Record'}
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {loadingDependencies && (
              <p className="text-gray-500 mb-4 flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i> Loading student and course data...
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* This is the key change: Only hide the dropdown if we are EDITING */}
              {!studentToEdit && (
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                    Associated User (Student Role)
                  </label>
                  <select
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required // Required when adding a new student
                    disabled={loadingDependencies}
                  >
                    <option value="">Select a User with 'Student' Role</option>
                    {studentUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select an existing user who will be linked as this student.
                  </p>
                </div>
              )}

              {/* Display Associated User Info (Read-only when editing) */}
              {studentToEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Associated User
                  </label>
                  <p className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-800 sm:text-sm">
                    {studentToEdit.user.firstName} {studentToEdit.user.lastName} (
                    {studentToEdit.user.email})
                  </p>
                </div>
              )}

              {/* Student ID */}
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Current Class */}
              <div>
                <label htmlFor="currentClass" className="block text-sm font-medium text-gray-700">
                  Current Class (Optional)
                </label>
                <input
                  type="text"
                  id="currentClass"
                  name="currentClass"
                  value={formData.currentClass}
                  onChange={handleChange}
                  placeholder="e.g., JSS1A, SS2C"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* ⭐ New "Current Term" field ⭐ */}
              <div>
                <label htmlFor="currentTerm" className="block text-sm font-medium text-gray-700">
                  Current Term (Optional)
                </label>
                <input
                  type="text"
                  id="currentTerm"
                  name="currentTerm"
                  value={formData.currentTerm}
                  onChange={handleChange}
                  placeholder="e.g., Fall 2024, Term 1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Enrolled Courses */}
              <div>
                <label htmlFor="enrolledCourses" className="block text-sm font-medium text-gray-700">
                  Enrolled Courses (Ctrl/Cmd + Click to select multiple)
                </label>
                <select
                  id="enrolledCourses"
                  name="enrolledCourses"
                  multiple
                  value={formData.enrolledCourses}
                  onChange={handleCourseChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-32"
                  disabled={loadingDependencies}
                >
                  {allCourses.length === 0 && !loadingDependencies ? (
                    <option value="" disabled>
                      No courses available
                    </option>
                  ) : (
                    allCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Associated Parent */}
              <div>
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                  Associated Parent (Optional)
                </label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={loadingDependencies}
                >
                  <option value="">Select a User with 'Parent' Role (Optional)</option>
                  {parentUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  You can link an existing user with the 'parent' role to this student.
                </p>
              </div>

              {/* Action Buttons */}
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
                  {isSubmitting
                    ? 'Saving...'
                    : studentToEdit
                    ? 'Save Changes'
                    : 'Create Student'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StudentFormModal;