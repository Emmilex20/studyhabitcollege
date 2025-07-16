/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/modals/StudentFormModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Student {
  _id: string;
  user: { _id: string; firstName: string; lastName: string; email: string };
  studentId: string;
  dateOfBirth: string;
  gender: string;
  currentClass?: string;
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
  studentToEdit?: Student | null;
  onSave: (student: Student) => void;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  onSave,
}) => {
  const { userInfo } = useAuth();
  const [formData, setFormData] = useState({
    userId: '',
    studentId: '',
    dateOfBirth: '',
    gender: '',
    currentClass: '',
    enrolledCourses: [] as string[],
    parentId: '',
  });
  const [studentUsers, setStudentUsers] = useState<UserOption[]>([]);
  const [parentUsers, setParentUsers] = useState<UserOption[]>([]);
  const [allCourses, setAllCourses] = useState<CourseOption[]>([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        userId: studentToEdit.user._id,
        studentId: studentToEdit.studentId,
        dateOfBirth: studentToEdit.dateOfBirth.split('T')[0],
        gender: studentToEdit.gender,
        currentClass: studentToEdit.currentClass || '',
        enrolledCourses: studentToEdit.enrolledCourses.map((c) => c._id),
        parentId: studentToEdit.parent?._id || '',
      });
    } else {
      setFormData({
        userId: '',
        studentId: '',
        dateOfBirth: '',
        gender: '',
        currentClass: '',
        enrolledCourses: [],
        parentId: '',
      });
    }
    setError(null);
  }, [studentToEdit, isOpen]);

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
        const { data: usersData } = await axios.get(
          'http://localhost:5000/api/users',
          config
        );
        setStudentUsers(usersData.filter((u: UserOption) => u.role === 'student'));
        setParentUsers(usersData.filter((u: UserOption) => u.role === 'parent'));

        const { data: coursesData } = await axios.get(
          'http://localhost:5000/api/courses',
          config
        );
        setAllCourses(coursesData);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch dependencies:', err);
        setError(
          err.response?.data?.message || 'Failed to load dependencies (users/courses).'
        );
      } finally {
        setLoadingDependencies(false);
      }
    };

    if (isOpen) {
      fetchDependencies();
    }
  }, [isOpen, userInfo?.token]); // ✅ Fixed dependency to avoid re-trigger loops

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, enrolledCourses: options }));
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
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        parentId: formData.parentId === '' ? null : formData.parentId,
      };

      if (studentToEdit) {
        response = await axios.put(
          `http://localhost:5000/api/students/${studentToEdit._id}`,
          payload,
          config
        );
      } else {
        response = await axios.post(
          'http://localhost:5000/api/students',
          payload,
          config
        );
      }

      onSave(response.data);
      onClose();
    } catch (err: any) {
      console.error('Student form submission error:', err);
      setError(err.response?.data?.message || 'Failed to save student record.');
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
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b pb-3">
              {studentToEdit ? 'Edit Student Record' : 'Create New Student Record'}
            </h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loadingDependencies && (
              <p className="text-gray-500 mb-4">Loading student and course data...</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    required
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
                    Make sure you've registered a user with the 'student' role first.
                  </p>
                </div>
              )}

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

              <div>
                <label htmlFor="enrolledCourses" className="block text-sm font-medium text-gray-700">
                  Enrolled Courses (Ctrl+Click to select multiple)
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
