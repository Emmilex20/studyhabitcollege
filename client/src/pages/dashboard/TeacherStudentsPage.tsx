// src/pages/dashboard/TeacherStudentsPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

interface Student {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    dateOfBirth: string;
    phoneNumber?: string;
    address?: string;
  };
  studentId: string;
  currentClass?: string;
  enrolledCourses: { _id: string; name: string; code: string }[];
  parent?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }; // ✅ update to match how backend populates
}

interface CourseOption {
  _id: string;
  name: string;
  code: string;
}

const TeacherStudentsPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<CourseOption[]>([]); // To filter students by *your* courses
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherStudentsAndCourses = async () => {
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
        };

        // Fetch courses taught by this teacher first (backend already filters for teacher role)
        const { data: coursesData } = await axios.get('http://localhost:5000/api/courses', config);
        setTeacherCourses(coursesData);
        const teacherCourseIds = new Set(coursesData.map((c: CourseOption) => c._id));

        // Fetch students (backend already filters students in teacher's courses)
        const { data: studentsData } = await axios.get('http://localhost:5000/api/students', config);

        // Client-side filter to ensure we only display students associated with *any* of the teacher's courses
        // This is a safety measure; the backend should handle most of this.
        const filteredStudents = studentsData.filter((student: Student) =>
            student.enrolledCourses.some(course => teacherCourseIds.has(course._id))
        );

        setStudents(filteredStudents);
        setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch students.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherStudentsAndCourses();
  }, [userInfo]);

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading your students...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="teacher-students-page"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">My Students</h2>
      <p className="text-gray-700 mb-4">Here are the students enrolled in your courses.</p>

      {students.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No students found in your assigned courses.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Class
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Courses Enrolled (Your Courses)
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Parent
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {student.studentId}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {student.user.firstName} {student.user.lastName}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {student.user.email}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {student.currentClass || 'N/A'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {student.enrolledCourses.length > 0
                      ? student.enrolledCourses.filter(course =>
                            // This client-side filter ensures we only show the courses that *this teacher* teaches AND the student is in.
                            teacherCourses.some(tc => tc._id === course._id)
                        ).map(course => (
                          <span key={course._id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {course.name}
                          </span>
                        ))
                      : 'No courses'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {student.parent
                  ? `${student.parent.firstName} ${student.parent.lastName}`
                  : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default TeacherStudentsPage;