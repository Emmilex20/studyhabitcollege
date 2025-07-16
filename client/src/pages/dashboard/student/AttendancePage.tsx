// src/pages/dashboard/student/AttendancePage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // ✅ Using axios directly now
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
            try {
                setLoading(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo?.token}`,
                    },
                    withCredentials: true, // 🔐 important if using secure cookies
                };
                const response = await axios.get('http://localhost:5000/api/students/me/attendance', config);
                setAttendanceRecords(response.data);
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

    if (loading) return <p>Loading attendance...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (attendanceRecords.length === 0) return <p>No attendance records found.</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">My Attendance</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Course</th>
                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceRecords.map((record) => (
                            <tr key={record._id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4 text-sm text-gray-800">
                                    {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-800">
                                    {record.course ? `${record.course.name} (${record.course.code})` : 'N/A'}
                                </td>
                                <td className="py-2 px-4 text-sm font-medium">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        record.status === 'Present'
                                            ? 'bg-green-100 text-green-800'
                                            : record.status === 'Absent'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-600">{record.reason || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendancePage;
