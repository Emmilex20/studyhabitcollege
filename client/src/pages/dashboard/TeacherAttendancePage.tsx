/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/TeacherAttendancePage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // Added AnimatePresence, easeOut
import AttendanceFormModal from '../../components/modals/AttendanceFormModal';

interface Attendance {
  _id: string;
  student: { _id: string; user: { _id: string; firstName: string; lastName: string; }; studentId: string; };
  course?: { _id: string; name: string; code: string; };
  teacher?: { _id: string; firstName: string; lastName: string; };
  date: string; // ISO string
  status: string;
  remarks?: string;
  createdAt: string;
}

const TeacherAttendancePage: React.FC = () => {
  const { userInfo } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchAttendance = async () => {
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
      // Backend should filter attendance records to only those for courses taught by this teacher
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/attendance', config);
      setAttendanceRecords(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance records. Please try again.');
      console.error('Error fetching attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  const handleAddAttendanceClick = () => {
    setSelectedAttendance(null);
    setIsModalOpen(true);
  };

  const handleEditAttendanceClick = (record: Attendance) => {
    setSelectedAttendance(record);
    setIsModalOpen(true);
  };

  const handleSaveAttendance = async () => {
    await fetchAttendance(); // Re-fetch all records after save
  };

  const handleDeleteAttendance = async (recordId: string, studentName: string, date: string, courseName?: string) => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
      return;
    }
    const confirmMessage = courseName
      ? `Are you sure you want to delete the attendance record for ${studentName} in ${courseName} on ${new Date(date).toLocaleDateString()}? This action cannot be undone.`
      : `Are you sure you want to delete the general attendance record for ${studentName} on ${new Date(date).toLocaleDateString()}? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      setDeleteLoading(recordId);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
          withCredentials: true,
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/attendance/${recordId}`, config);
        await fetchAttendance();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete attendance record.');
        console.error('Error deleting attendance record:', err);
      } finally {
        setDeleteLoading(null);
      }
    }
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
      className="teacher-attendance-page p-4 sm:p-6 bg-gray-50 min-h-screen font-sans"
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-clipboard-check mr-3 text-green-600"></i> Record & View Attendance
      </h2>
      <p className="text-gray-700 mb-8 text-lg">
        Keep track of student attendance for your assigned courses and any general activities you oversee. ✍️
      </p>

      <button
        onClick={handleAddAttendanceClick}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 flex items-center"
      >
        <i className="fas fa-plus mr-2"></i> Add New Attendance Record
      </button>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="ml-4 text-lg text-gray-600">Loading attendance records... 🔄</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
          <p className="text-xl font-semibold mb-2 flex items-center justify-center">
            <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Attendance!
          </p>
          <p>{error}</p>
          <p className="text-sm mt-3 text-red-500">Please ensure you are logged in as a teacher. ⚠️</p>
        </div>
      ) : attendanceRecords.length === 0 ? (
        <div className="text-center py-10 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
          <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Attendance Records Found!
          </p>
          <p className="text-gray-600">
            It looks like there are no attendance records for your courses yet. Click "Add New Attendance Record" to get started!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
          <table className="min-w-full leading-normal divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Recorded By
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {attendanceRecords.map((record, index) => (
                  <motion.tr 
                    key={record._id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={tableRowVariants}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                          <i className="fas fa-user-graduate text-blue-500 mr-2"></i>
                          <span className="font-medium">
                              {record.student?.user?.firstName} {record.student?.user?.lastName}
                          </span>
                          <span className="text-gray-500 ml-1">({record.student?.studentId})</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                          <i className="fas fa-book-open text-purple-500 mr-2"></i>
                          {record.course ? `${record.course.name} (${record.course.code})` : 'General'}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                      <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${
                          record.status === 'Present' ? 'text-green-800 bg-green-100' :
                          record.status === 'Absent' ? 'text-red-800 bg-red-100' :
                          record.status === 'Late' ? 'text-yellow-800 bg-yellow-100' :
                          'text-gray-800 bg-gray-100'
                      }`}>
                        {record.status}
                      </span>
                      {record.remarks && <p className="text-xs text-gray-500 italic mt-1">{record.remarks}</p>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.teacher ? `${record.teacher.firstName} ${record.teacher.lastName}` : 'N/A'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditAttendanceClick(record)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                        title="Edit Attendance"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAttendance(record._id, `${record.student?.user?.firstName} ${record.student?.user?.lastName}`, record.date, record.course?.name)}
                        className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                        disabled={deleteLoading === record._id}
                        title="Delete Attendance"
                      >
                        {deleteLoading === record._id ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-1"></i> Deleting...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-trash-alt"></i> Delete
                            </>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <AttendanceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        attendanceToEdit={selectedAttendance}
        onSave={handleSaveAttendance}
        isTeacherView={true} // Indicate this is for a teacher
      />
    </motion.div>
  );
};

export default TeacherAttendancePage;