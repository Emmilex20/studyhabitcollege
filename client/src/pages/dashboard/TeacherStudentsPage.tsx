/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/TeacherStudentsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, easeOut } from 'framer-motion';
import StudentFormModal from '../../components/modals/StudentFormModal'; // Import the StudentFormModal

interface Student {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    // Note: The 'user' object might *also* have dateOfBirth and gender
    // if your User schema includes it, but the primary Student properties are top-level.
    phoneNumber?: string;
    address?: string;
  };
  studentId: string;
  // THESE ARE THE MISSING PROPERTIES THAT NEED TO BE AT THE TOP LEVEL
  dateOfBirth: string; // <-- ADD THIS HERE!
  gender: string;      // <-- ADD THIS HERE!
  currentClass?: string;
  enrolledCourses: { _id: string; name: string; code: string }[];
  parent?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface CourseOption {
  _id: string;
  name: string;
  code: string;
}

const TeacherStudentsPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null); // State for editing

  const fetchTeacherStudentsAndCourses = useCallback(async () => {
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
        withCredentials: true, // Ensure cookies are sent
      };

      // Fetch courses taught by this teacher first (backend already filters for teacher role)
      const { data: coursesData } = await axios.get('https://studyhabitcollege.onrender.com/api/courses', config);
      setTeacherCourses(coursesData);
      const teacherCourseIds = new Set(coursesData.map((c: CourseOption) => c._id));

      // Fetch students
      const { data: studentsData } = await axios.get('https://studyhabitcollege.onrender.com/api/students', config);

      // Client-side filter to ensure we only display students associated with *any* of the teacher's courses
      const filteredStudents = studentsData.filter((student: Student) =>
        student.enrolledCourses.some(course => teacherCourseIds.has(course._id))
      );

      setStudents(filteredStudents);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students. Please try again.');
      console.error('Error fetching teacher students:', err);
    } finally {
      setLoading(false);
    }
  }, [userInfo]); // Depend on userInfo to re-fetch if user changes

  useEffect(() => {
    fetchTeacherStudentsAndCourses();
  }, [fetchTeacherStudentsAndCourses]); // Now depends on useCallback

  const handleAddStudentClick = () => {
    setSelectedStudent(null); // Clear any previously selected student
    setIsModalOpen(true);
  };

  const handleEditStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async () => {
    // After saving, re-fetch the students to update the list
    await fetchTeacherStudentsAndCourses();
  };

  // Framer Motion Variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05, // Stagger effect
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
      className="teacher-students-page p-4 sm:p-6 bg-gray-50 min-h-screen font-sans"
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-users-class mr-3 text-indigo-600"></i> My Students
      </h2>
      <p className="text-gray-700 mb-8 text-lg">
        View and manage students enrolled in the courses you teach. 🧑‍🎓
      </p>

      {/* Add New Student Button */}
      <button
        onClick={handleAddStudentClick}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 flex items-center justify-center"
      >
        <i className="fas fa-user-plus mr-2"></i> Add New Student
      </button>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="ml-4 text-lg text-gray-600">Loading your students... 🔄</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
          <p className="text-xl font-semibold mb-2 flex items-center justify-center">
            <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Students!
          </p>
          <p>{error}</p>
          <p className="text-sm mt-3 text-red-500">Please ensure you are logged in as a teacher. ⚠️</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-10 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
          <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Students Found!
          </p>
          <p className="text-gray-600">
            It looks like no students are currently enrolled in any of your assigned courses. You can add one using the button above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
          <table className="min-w-full leading-normal divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Class
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Courses Enrolled (Your Courses)
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th> {/* Added Actions column */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {students.map((student, index) => (
                  <motion.tr
                    key={student._id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={tableRowVariants}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-mono text-blue-700">{student.studentId}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <i className="fas fa-user-circle text-lg text-green-500 mr-2"></i>
                        <span className="font-medium">{student.user.firstName} {student.user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.user.email}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold text-purple-700">{student.currentClass || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {student.enrolledCourses.length > 0
                          ? student.enrolledCourses
                              .filter(course =>
                                teacherCourses.some(tc => tc._id === course._id)
                              )
                              .map(course => (
                                <span key={course._id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                  {course.name} ({course.code})
                                </span>
                              ))
                          : <span className="text-gray-500 italic">No courses</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.parent
                        ? <span className="font-medium text-orange-700">{student.parent.firstName} {student.parent.lastName}</span>
                        : 'N/A'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                        <button
                            onClick={() => handleEditStudentClick(student)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                            title="Edit Student"
                        >
                            <i className="fas fa-edit"></i> Edit
                        </button>
                    </td> {/* Added Edit Button */}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentToEdit={selectedStudent}
        onSave={handleSaveStudent}
        isTeacherView={false} // Add this prop to potentially adjust modal behavior for teachers
      />
    </motion.div>
  );
};

export default TeacherStudentsPage;