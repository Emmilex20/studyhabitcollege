/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminAttendancePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, type Variants } from 'framer-motion'; // Import AnimatePresence and Variants
import AttendanceFormModal from '../../components/modals/AttendanceFormModal'; // Import the modal

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

const AdminAttendancePage: React.FC = () => {
  const { userInfo } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null); // For editing
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Framer Motion Variants for page entry
  const pageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }, // Using easeOut cubic-bezier
  };

  // Framer Motion Variants for table rows (for enter/exit animations)
  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  const fetchAttendance = useCallback(async () => {
    // Ensure only admins can access this page
    if (!userInfo?.token || userInfo.role !== 'admin') {
      setError('You are not authorized to view this page. Admin access required.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/attendance', config);
      setAttendanceRecords(data);
    } catch (err: any) {
      console.error('Error fetching attendance records:', err);
      setError(err.response?.data?.message || 'Failed to fetch attendance records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token, userInfo?.role]); // Added userInfo.role to dependencies

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]); // Use fetchAttendance directly, it's already memoized with useCallback

  const handleAddAttendanceClick = () => {
    setSelectedAttendance(null); // Clear selection for create mode
    setIsModalOpen(true);
  };

  const handleEditAttendanceClick = (record: Attendance) => {
    setSelectedAttendance(record);
    setIsModalOpen(true);
  };

  const handleSaveAttendance = async () => {
    await fetchAttendance(); // Re-fetch all records to update the list
    setIsModalOpen(false); // Close modal on successful save
    alert('Attendance record saved successfully!'); // Provide user feedback
  };

  const handleDeleteAttendance = async (recordId: string, studentName: string, date: string, courseName?: string) => {
    if (!userInfo?.token || userInfo.role !== 'admin') {
      alert('You are not authorized to delete attendance records.');
      return;
    }

    const confirmMessage = courseName
      ? `Are you sure you want to delete the attendance record for "${studentName}" in "${courseName}" on ${new Date(date).toLocaleDateString()}? This action cannot be undone.`
      : `Are you sure you want to delete the general attendance record for "${studentName}" on ${new Date(date).toLocaleDateString()}? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      setDeleteLoading(recordId); // Set loading state for the specific record's delete button
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/attendance/${recordId}`, config);
        await fetchAttendance(); // Re-fetch attendance records to update the list
        alert('Attendance record deleted successfully!'); // User feedback
      } catch (err: any) {
        console.error('Error deleting attendance record:', err);
        setError(err.response?.data?.message || 'Failed to delete attendance record.');
        alert(`Error deleting attendance record: ${err.response?.data?.message || 'Please try again.'}`);
      } finally {
        setDeleteLoading(null); // Clear loading state
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="admin-attendance-page p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans antialiased text-gray-800 rounded-lg shadow-inner"
    >
      {/* Page Header */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4 flex items-center">
        <i className="fas fa-calendar-check mr-3 text-indigo-600"></i> Manage Attendance
      </h2>
      <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl">
        As an administrator, you can view, add, edit, and delete student attendance records for courses and general activities.
      </p>

      {/* Add New Attendance Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddAttendanceClick}
        className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 flex items-center justify-center font-semibold text-lg"
      >
        <i className="fas fa-plus mr-2 text-white"></i> Add New Attendance Record
      </motion.button>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-lg border border-blue-100 animate-pulse-fade">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Loading attendance records... Please wait. 📅</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 px-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl shadow-md">
          <p className="text-2xl font-bold mb-3 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i> Error Loading Attendance!
          </p>
          <p className="text-lg mb-4">{error}</p>
          <p className="text-md text-red-700 font-semibold">
            Please check your network connection or ensure you have administrative privileges.
          </p>
          <button
            onClick={fetchAttendance}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
          >
            <i className="fas fa-redo-alt mr-2"></i> Retry Fetching Attendance
          </button>
        </div>
      )}

      {/* No Records Found State */}
      {!loading && !error && attendanceRecords.length === 0 && (
        <div className="text-center py-12 px-6 bg-blue-50 rounded-xl shadow-inner border-2 border-blue-200">
          <p className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Attendance Records Found
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            There are currently no attendance entries in the system.
            <br /> Click the "Add New Attendance Record" button above to begin tracking student presence! 📊
          </p>
        </div>
      )}

      {/* Attendance Records Table */}
      {!loading && !error && attendanceRecords.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal table-auto">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Student
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Course/Activity
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Recorded By
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {attendanceRecords.map((record) => (
                    <motion.tr
                      key={record._id}
                      initial="hidden"
                      animate="visible"
                      variants={rowVariants}
                      exit="exit"
                      className="border-b border-gray-100 hover:bg-blue-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-5 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-xs">
                              {record.student?.user?.firstName?.[0]}{record.student?.user?.lastName?.[0]}
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-gray-900 font-medium">{record.student?.user?.firstName} {record.student?.user?.lastName}</p>
                            <p className="text-gray-600 text-xs mt-0.5">ID: {record.student?.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {record.course ? (
                          <span className="font-semibold text-purple-700">
                            {record.course.name} <span className="block text-xs text-gray-500 mt-0.5">({record.course.code})</span>
                          </span>
                        ) : (
                          <span className="italic text-gray-500">General Activity</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full text-xs
                          ${record.status === 'Present' ? 'text-green-800 bg-green-100' :
                            record.status === 'Absent' ? 'text-red-800 bg-red-100' :
                            record.status === 'Late' ? 'text-yellow-800 bg-yellow-100' :
                            'text-gray-800 bg-gray-100' // Fallback
                          }`}
                        >
                          {record.status}
                        </span>
                        {record.remarks && <p className="text-xs text-gray-500 italic mt-1 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={record.remarks}>{record.remarks}</p>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {record.teacher ? (
                          <span className="text-green-700 font-medium">
                            {record.teacher.firstName} {record.teacher.lastName}
                          </span>
                        ) : (
                          <span className="italic text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEditAttendanceClick(record)}
                          className="inline-flex items-center px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-medium mr-2 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          title="Edit attendance record"
                        >
                          <i className="fas fa-edit mr-1"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAttendance(
                            record._id,
                            `${record.student?.user?.firstName || ''} ${record.student?.user?.lastName || ''}`,
                            record.date,
                            record.course?.name
                          )}
                          className="inline-flex items-center px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md font-medium disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          disabled={deleteLoading === record._id}
                          title="Delete attendance record"
                        >
                          {deleteLoading === record._id ? (
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                          ) : (
                            <i className="fas fa-trash-alt mr-1"></i>
                          )}
                          {deleteLoading === record._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AttendanceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        attendanceToEdit={selectedAttendance}
        onSave={handleSaveAttendance}
      />
    </motion.div>
  );
};

export default AdminAttendancePage;