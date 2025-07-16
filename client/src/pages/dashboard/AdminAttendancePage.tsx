/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminAttendancePage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
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

  const fetchAttendance = async () => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
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
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/attendance', config);
      setAttendanceRecords(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  const handleAddAttendanceClick = () => {
    setSelectedAttendance(null); // Clear selection for create mode
    setIsModalOpen(true);
  };

  const handleEditAttendanceClick = (record: Attendance) => {
    setSelectedAttendance(record);
    setIsModalOpen(true);
  };

  const handleSaveAttendance = async () => {
    await fetchAttendance(); // Re-fetch all records
  };

  const handleDeleteAttendance = async (recordId: string, studentName: string, date: string, courseName?: string) => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
      return;
    }
    const confirmMessage = courseName
      ? `Are you sure you want to delete the attendance record for ${studentName} in ${courseName} on ${new Date(date).toLocaleDateString()}?`
      : `Are you sure you want to delete the general attendance record for ${studentName} on ${new Date(date).toLocaleDateString()}?`;

    if (window.confirm(confirmMessage)) {
      setDeleteLoading(recordId);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/attendance/${recordId}`, config);
        await fetchAttendance();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete attendance record.');
        console.error(err);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading attendance records...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="admin-attendance-page"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Manage Attendance</h2>
      <p className="text-gray-700 mb-4">Record and manage student attendance across all courses and general activities.</p>

      <button
        onClick={handleAddAttendanceClick}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <i className="fas fa-plus mr-2"></i> Add New Attendance Record
      </button>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Student
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Course
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Recorded By
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record) => (
              <tr key={record._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {record.student?.user?.firstName} {record.student?.user?.lastName} ({record.student?.studentId})
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {record.course ? `${record.course.name} (${record.course.code})` : 'General'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      record.status === 'Present' ? 'text-green-900 bg-green-200' :
                      record.status === 'Absent' ? 'text-red-900 bg-red-200' :
                      record.status === 'Late' ? 'text-yellow-900 bg-yellow-200' :
                      'text-gray-900 bg-gray-200'
                    } rounded-full`}>
                    {record.status}
                  </span>
                  {record.remarks && <p className="text-xs text-gray-500 italic mt-1">{record.remarks}</p>}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {record.teacher ? `${record.teacher.firstName} ${record.teacher.lastName}` : 'N/A'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button
                    onClick={() => handleEditAttendanceClick(record)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAttendance(record._id, `${record.student?.user?.firstName} ${record.student?.user?.lastName}`, record.date, record.course?.name)}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={deleteLoading === record._id}
                  >
                    {deleteLoading === record._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {attendanceRecords.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500 mt-4">No attendance records found. Add a new record!</p>
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