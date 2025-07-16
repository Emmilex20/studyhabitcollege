// src/pages/dashboard/parent/ParentChildrenPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext'; // ✅ to get token

// Interfaces
interface UserInfo {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    dateOfBirth: string;
    phoneNumber?: string;
    address?: string;
}

interface CourseSummary {
    _id: string;
    name: string;
    code: string;
}

interface Child {
    _id: string;
    user: UserInfo;
    studentId: string;
    currentClass?: string;
    enrolledCourses: CourseSummary[];
}

const ParentChildrenPage: React.FC = () => {
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const { userInfo } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                setLoading(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo?.token}`,
                    },
                    withCredentials: true,
                };
                const response = await axios.get('http://localhost:5000/api/parents/me/children', config);
                setChildren(response.data);
                if (response.data.length > 0 && !selectedChildId && !location.pathname.includes('/child/')) {
                    const firstChildId = response.data[0]._id;
                    setSelectedChildId(firstChildId);
                    navigate(`/dashboard/child/${firstChildId}/grades`, { replace: true });

                }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error('Error fetching children:', err);
                setError(err.response?.data?.message || 'Failed to load children. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        if (userInfo?.token) fetchChildren();
    }, [userInfo, selectedChildId, location.pathname, navigate]);

    if (loading) return <p>Loading children...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (children.length === 0) return <p>No children linked to your account.</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">My Children</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {children.map((child) => (
                    <div
                        key={child._id}
                        className={`bg-white p-4 rounded-lg shadow-md border cursor-pointer
                            ${selectedChildId === child._id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:shadow-lg'}`}
                        onClick={() => {
                            setSelectedChildId(child._id);
                            navigate(`/dashboard/child/${child._id}/grades`);
                        }}
                    >
                        <h3 className="text-lg font-semibold text-gray-800">
                            {child.user.firstName} {child.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">Student ID: {child.studentId}</p>
                        <p className="text-sm text-gray-600">Class: {child.currentClass || 'N/A'}</p>
                        <p className="text-sm text-gray-600">
                            Enrolled in: {child.enrolledCourses.map(c => c.name).join(', ') || 'None'}
                        </p>
                    </div>
                ))}
            </div>

            {selectedChildId && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Details for {children.find(c => c._id === selectedChildId)?.user.firstName}
                    </h3>
                    <div className="flex space-x-4 mb-4 border-b pb-2">
                        <Link to={`/dashboard/child/${selectedChildId}/grades`}
                            className={`py-2 px-4 rounded-md text-sm font-medium
                                ${location.pathname.includes(`/child/${selectedChildId}/grades`) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                        >
                            Grades
                        </Link>
                        <Link to={`/dashboard/child/${selectedChildId}/attendance`}
                            className={`py-2 px-4 rounded-md text-sm font-medium
                                ${location.pathname.includes(`/child/${selectedChildId}/attendance`) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                        >
                            Attendance
                        </Link>
                    </div>
                    <Outlet />
                </div>
            )}
        </div>
    );
};

export default ParentChildrenPage;
