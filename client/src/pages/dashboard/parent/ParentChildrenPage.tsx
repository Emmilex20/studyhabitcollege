// src/pages/dashboard/parent/ParentChildrenPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext'; // ✅ to get token

// Removed the UserInfo interface as it's no longer directly used in Child
// interface UserInfo {
//     _id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     gender: string;
//     dateOfBirth: string;
//     phoneNumber?: string;
//     address?: string;
// }

interface CourseSummary {
    _id: string;
    name: string;
    code: string;
}

// ✅ UPDATED CHILD INTERFACE to match the flat structure from your backend
interface Child {
    _id: string;
    firstName: string; // Directly on the Child object
    lastName: string;  // Directly on the Child object
    studentId: string;
    currentClass?: string;
    enrolledCourses: CourseSummary[];
    gradeAverage?: number;       // Add these as your backend sends them now
    attendancePercentage?: number; // Add these as your backend sends them now
    avatarUrl?: string;          // Add if your backend sends it
}

const ParentChildrenPage: React.FC = () => {
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Removed setSelectedChildId from state as it's now primarily derived from the URL
    // and handled by the useEffect's navigation logic.
    // If you need it for UI selection, it should be derived from location.pathname
    // or passed down from a parent component.
    const [activeChildId, setActiveChildId] = useState<string | null>(null);


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
                const response = await axios.get('https://studyhabitcollege.onrender.com/api/parents/me/children', config);
                setChildren(response.data);

                if (response.data.length > 0) {
                    const firstChildId = response.data[0]._id;
                    const pathParts = location.pathname.split('/');
                    // Attempt to extract studentId from the URL (e.g., /dashboard/child/STUDENT_ID/grades)
                    const studentIdInUrl = pathParts[3]; 
                    
                    // Determine the ID to make active: prefer URL's ID, then the first child's ID
                    const idToActivate = studentIdInUrl || firstChildId;
                    setActiveChildId(idToActivate);

                    // If the current path does not match the determined active child's sub-route, navigate
                    if (!location.pathname.includes(`/dashboard/child/${idToActivate}/`)) {
                        navigate(`/dashboard/child/${idToActivate}/grades`, { replace: true });
                    }
                }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error('Error fetching children:', err);
                setError(err.response?.data?.message || 'Failed to load children. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (userInfo?.token) {
            fetchChildren();
        }
        // Removed selectedChildId from dependencies. The logic now robustly
        // derives the activeChildId based on URL or defaults to the first child.
        // navigate is stable and location.pathname is already a dependency.
    }, [userInfo, location.pathname, navigate]); 

    if (loading) return <p className="text-center py-10 text-gray-600">Loading children...</p>;
    if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
    if (children.length === 0) return <p className="text-center py-10 text-gray-500">No children linked to your account.</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">My Children</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {children.map((child) => (
                    <div
                        key={child._id}
                        className={`bg-white p-4 rounded-lg shadow-md border cursor-pointer
                            ${activeChildId === child._id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:shadow-lg'}`}
                        onClick={() => {
                            setActiveChildId(child._id); // Update active child on click
                            navigate(`/dashboard/child/${child._id}/grades`); // Navigate to grades by default
                        }}
                    >
                        <h3 className="text-lg font-semibold text-gray-800">
                            {child.firstName} {child.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">Student ID: {child.studentId}</p>
                        <p className="text-sm text-gray-600">Class: {child.currentClass || 'N/A'}</p>
                        <p className="text-sm text-gray-600">
                            Enrolled in: {child.enrolledCourses.map(c => c.name).join(', ') || 'None'}
                        </p>
                        {typeof child.gradeAverage === 'number' && (
                            <p className="text-sm text-gray-600">Grade Avg: {child.gradeAverage.toFixed(1)}%</p>
                        )}
                        {typeof child.attendancePercentage === 'number' && (
                            <p className="text-sm text-gray-600">Attendance: {child.attendancePercentage.toFixed(1)}%</p>
                        )}
                    </div>
                ))}
            </div>

            {activeChildId && ( // Use activeChildId here
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Details for {children.find(c => c._id === activeChildId)?.firstName} 
                    </h3>
                    <div className="flex space-x-4 mb-4 border-b pb-2">
                        <Link to={`/dashboard/child/${activeChildId}/grades`} 
                            className={`py-2 px-4 rounded-md text-sm font-medium
                                ${location.pathname.includes(`/child/${activeChildId}/grades`) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                        >
                            Grades
                        </Link>
                        <Link to={`/dashboard/child/${activeChildId}/attendance`} 
                            className={`py-2 px-4 rounded-md text-sm font-medium
                                ${location.pathname.includes(`/child/${activeChildId}/attendance`) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
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