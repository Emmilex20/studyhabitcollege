// src/pages/dashboard/student/AttendancePage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, easeOut } from 'framer-motion'; // Import motion and easeOut
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

const AttendancePage: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { userInfo } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      // Basic validation for student role and token
      if (!userInfo?.token || userInfo.role !== 'student') {
        setError('Authentication required: You must be logged in as a student to view attendance.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
          withCredentials: true, // 🔐 important if using secure cookies
        };
        const response = await axios.get('https://studyhabitcollege.onrender.com/api/students/me/attendance', config);

        // Ensure response data is an array or handle nested array if API sends it that way
        const data = response.data;
        if (Array.isArray(data)) {
          setAttendanceRecords(data);
        } else if (data && Array.isArray(data.attendanceRecords)) {
          setAttendanceRecords(data.attendanceRecords);
        } else {
          setAttendanceRecords([]); // Default to empty array if unexpected format
        }

        setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching attendance:', err);
        setError(err.response?.data?.message || 'Failed to load attendance records. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) {
      fetchAttendance();
    }
  }, [userInfo]);

  // Framer Motion variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  // Status badge styling helper
  const getStatusClasses = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Tardy':
        return 'bg-yellow-100 text-yellow-800';
      case 'Excused Absent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading attendance records... <span className="italic">Hang tight!</span></p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
      >
        <p className="text-xl font-semibold mb-2 flex items-center justify-center">
          <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Attendance!
        </p>
        <p>{error}</p>
        <p className="text-sm mt-3 text-red-500">Please ensure you are logged in as a student and try refreshing the page.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="my-attendance-page p-4 sm:p-0" // Add responsive padding
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-user-check mr-3 text-yellow-500"></i> My Attendance
      </h2>
      <p className="text-gray-700 mb-8 text-lg">
        Keep track of your attendance for all enrolled courses. Consistency is key!
      </p>

      {attendanceRecords.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 bg-blue-50 rounded-lg shadow-inner border border-blue-200"
        >
          <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
            <i className="fas fa-clipboard-question mr-3 text-blue-500"></i> No Attendance Records Found!
          </p>
          <p className="text-gray-600">
            Attendance data for your courses is not yet available. Please check back later.
          </p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-calendar-day mr-2"></i> Date
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-book-open mr-2"></i> Course
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-info-circle mr-2"></i> Status
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-comment-alt mr-2"></i> Reason
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {attendanceRecords.map((record, index) => (
                <motion.tr
                  key={record._id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index} // Pass index for staggered animation
                  whileHover={{ backgroundColor: '#f3f4f6', scale: 1.005 }} // Subtle hover effect
                  transition={{ duration: 0.15 }}
                  className="hover:shadow-sm" // Add a subtle shadow on hover
                >
                  <td className="py-3 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm text-gray-700">
                    {record.course ? `${record.course.name} (${record.course.code})` : 'N/A'}
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm font-bold">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600 max-w-xs truncate lg:whitespace-normal">
                    {record.reason || 'No reason provided.'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default AttendancePage;