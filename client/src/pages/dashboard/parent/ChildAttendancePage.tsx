// src/pages/dashboard/parent/ChildAttendancePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
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

            try {
                setLoading(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo?.token}`,
                    },
                    withCredentials: true,
                };
                const response = await axios.get(
                    `http://localhost:5000/api/parents/child/${studentId}/attendance`,
                    config
                );
                setAttendanceRecords(response.data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error(`Error fetching attendance for child ${studentId}:`, err);
                setError(
                    err.response?.data?.message || 'Failed to load attendance records for this child. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        };

        if (userInfo?.token) fetchChildAttendance();
    }, [studentId, userInfo]);

    if (loading) return <p>Loading attendance...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (attendanceRecords.length === 0) return <p>No attendance records found for this child.</p>;

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Attendance</h3>
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
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            record.status === 'Present'
                                                ? 'bg-green-100 text-green-800'
                                                : record.status === 'Absent'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
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

export default ChildAttendancePage;
