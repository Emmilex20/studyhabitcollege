// src/pages/dashboard/parent/ChildAttendancePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // Import motion, AnimatePresence, and easeOut
import { useAuth } from '../../../context/AuthContext';

interface CourseSummary {
  name: string;
  code: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Tardy' | 'Excused Absent';
  reason?: string;
  course: CourseSummary;
}

const ChildAttendancePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { userInfo } = useAuth();

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildAttendance = async () => {
      if (!studentId) {
        setError('No student ID provided.');
        setLoading(false);
        return;
      }

      if (!userInfo?.token) {
        setError('Authentication required to fetch attendance records.');
        setLoading(false);
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
        const response = await axios.get(
          `https://studyhabitcollege.onrender.com/api/parents/child/${studentId}/attendance`,
          config
        );
        setAttendanceRecords(response.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(`Error fetching attendance for child ${studentId}:`, err.response?.data?.message || err.message);
        setError(
          err.response?.data?.message || 'Failed to load attendance records for this child. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChildAttendance();
  }, [studentId, userInfo]); // Add userInfo to dependencies to re-fetch if auth state changes

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.6,
        ease: easeOut,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading attendance records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
      >
        <p className="text-xl font-semibold mb-2 flex items-center justify-center">
          <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Attendance!
        </p>
        <p>{error}</p>
        <p className="text-sm mt-3 text-red-500">Please ensure the student ID is correct and you are logged in.</p>
      </motion.div>
    );
  }

  if (attendanceRecords.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center py-10 bg-blue-50 rounded-lg shadow-inner border border-blue-200"
      >
        <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
          <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Attendance Records Found Yet!
        </p>
        <p className="text-gray-600">
          It looks like your child doesn't have any attendance records at the moment.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="child-attendance-page p-4 bg-white rounded-lg shadow-xl border border-gray-100"
    >
      <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-calendar-check mr-3 text-purple-600"></i> Attendance Records
      </motion.h2>

      <motion.p variants={itemVariants} className="text-gray-700 mb-8 text-lg">
        Below is a comprehensive list of your child's attendance for each course.
      </motion.p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <i className="fas fa-calendar-alt mr-2"></i> Date
              </th>
              <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <i className="fas fa-book-open mr-2"></i> Course
              </th>
              <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <i className="fas fa-check-circle mr-2"></i> Status
              </th>
              <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <i className="fas fa-info-circle mr-2"></i> Reason
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            <AnimatePresence>
              {attendanceRecords.map((record) => (
                <motion.tr
                  key={record._id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ backgroundColor: '#f3f4f6', scale: 1.005 }}
                  className="transition-all duration-150 ease-in-out"
                >
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-gray-800">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <span className="font-semibold text-blue-700">
                      {record.course ? `${record.course.name}` : 'N/A'}
                    </span>
                    <p className="text-xs text-gray-500">
                      {record.course ? `(${record.course.code})` : ''}
                    </p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm font-medium">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'Present'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'Absent'
                          ? 'bg-red-100 text-red-800'
                          : record.status === 'Tardy'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-purple-100 text-purple-800' // For Excused Absent
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-gray-600">
                    {record.reason || 'N/A'}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ChildAttendancePage;