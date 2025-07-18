/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/DashboardOverview.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, easeOut } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom'; // Removed useLocation import
import axios from 'axios';
import AddUserModal from '../../components/modals/AddUserModal';
import CourseFormModal from '../../components/modals/CourseFormModal';

// Define interfaces for your fetched data structures
interface AdminDashboardData {
    totalUsers: number;
    activeCourses: number;
    enrolledStudents: number;
}

interface TeacherDashboardData {
    myActiveCourses: number;
    studentsTaught: number;
}

interface StudentDashboardData {
    enrolledCourses: number;
    overallGPA: number;
    upcomingDeadlines: { title: string; course: string; dueDate: string }[];
}

interface ChildData {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    gradeAverage: number;
    attendancePercentage: number;
    avatarUrl?: string;
}

interface ParentDashboardData {
    children: ChildData[];
    importantAnnouncements: { title: string; content: string }[];
}

interface Course {
    _id: string;
    name: string;
    code: string;
    description?: string;
    yearLevel: string;
    teacher?: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

const DashboardOverview: React.FC = () => {
    const { userInfo, userToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for different dashboard data
    const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
    const [teacherData, setTeacherData] = useState<TeacherDashboardData | null>(null);
    const [studentData, setStudentData] = useState<StudentDashboardData | null>(null);
    const [parentData, setParentData] = useState<ParentDashboardData | null>(null);

    // State for AddUserModal
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [addUserError, setAddUserError] = useState<string | null>(null);
    const [isAddingUser, setIsAddingUser] = useState(false);

    // State for CourseFormModal
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null); // To set to null for 'create' mode

    // Variants for section animations
    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: easeOut },
        },
    };

    // Variants for individual cards/items
    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4, ease: easeOut },
        },
    };

    const API_BASE_URL = 'https://studyhabitcollege.onrender.com/api';

    // Function to fetch admin data
    const fetchAdminData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };

            const [usersRes, coursesRes, studentsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/users/count`, config),
                axios.get(`${API_BASE_URL}/courses/count`, config),
                axios.get(`${API_BASE_URL}/students/count`, config),
            ]);

            setAdminData({
                totalUsers: usersRes.data.count || 0,
                activeCourses: coursesRes.data.count || 0,
                enrolledStudents: studentsRes.data.count || 0,
            });
        } catch (err: any) {
            console.error('Error fetching admin data:', err);
            setError(err.response?.data?.message || 'Failed to fetch admin data.');
        } finally {
            setLoading(false);
        }
    }, [userToken]);

    // Function to add a new user (for the modal)
    const handleAddNewUser = async (userData: { firstName: string; lastName: string; email: string; password?: string; role: string }) => {
        if (!userToken) {
            setAddUserError('Authentication required to add user.');
            return;
        }

        setIsAddingUser(true);
        setAddUserError(null);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
            };
            await axios.post(`${API_BASE_URL}/users/register`, userData, config);
            await fetchAdminData(); // Re-fetch admin data to update the total users count
            setIsAddUserModalOpen(false); // Close modal on success
            alert('User added successfully!'); // Or use a toast notification
        } catch (err: any) {
            console.error('Error adding new user:', err);
            setAddUserError(err.response?.data?.message || 'Failed to add user. Please try again.');
            throw err; // Re-throw to keep the modal's error state
        } finally {
            setIsAddingUser(false);
        }
    };

    // Handler for course modal save
    const handleSaveCourse = useCallback(async () => {
        await fetchAdminData(); // Refresh admin data to update course count
        setIsCourseModalOpen(false); // Close the modal
    }, [fetchAdminData]);

    // Function to fetch teacher data
    const fetchTeacherData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };

            const [coursesRes, studentsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/users/teacher/courses/count`, config),
                axios.get(`${API_BASE_URL}/users/teacher/students/count`, config),
            ]);

            setTeacherData({
                myActiveCourses: coursesRes.data.count || 0,
                studentsTaught: studentsRes.data.count || 0,
            });
        } catch (err: any) {
            console.error('Error fetching teacher data:', err);
            setError(err.response?.data?.message || 'Failed to fetch teacher data.');
        } finally {
            setLoading(false);
        }
    }, [userToken]);

    // Function to fetch student data
    const fetchStudentData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };

            const [coursesRes, gpaRes, deadlinesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/students/me/courses/count`, config),
                axios.get(`${API_BASE_URL}/students/me/gpa`, config),
                axios.get(`${API_BASE_URL}/students/me/deadlines`, config),
            ]);

            setStudentData({
                enrolledCourses: coursesRes.data.count || 0,
                overallGPA: gpaRes.data.gpa || 0.0,
                upcomingDeadlines: deadlinesRes.data.deadlines || [],
            });
        } catch (err: any) {
            console.error('Error fetching student data:', err);
            setError(err.response?.data?.message || 'Failed to fetch student data.');
        } finally {
            setLoading(false);
        }
    }, [userToken]);

    // Function to fetch parent data
    const fetchParentData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };

            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading time

            const [childrenRes, announcementsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/parents/me/children`, config),
                axios.get(`${API_BASE_URL}/announcements`, config),
            ]);

            setParentData({
                children: childrenRes.data || [],
                importantAnnouncements: announcementsRes.data || [],
            });
        } catch (err: any) {
            console.error('Error fetching parent data:', err);
            setError(err.response?.data?.message || 'Failed to fetch parent data.');
        } finally {
            setLoading(false);
        }
    }, [userToken]);


    useEffect(() => {
        if (userInfo && userToken) {
            // Clear previous data before fetching new role-specific data
            setAdminData(null);
            setTeacherData(null);
            setStudentData(null);
            setParentData(null);
            setError(null);
            setLoading(true);

            switch (userInfo.role) {
                case 'admin':
                    fetchAdminData();
                    break;
                case 'teacher':
                    fetchTeacherData();
                    break;
                case 'student':
                    fetchStudentData();
                    break;
                case 'parent':
                    fetchParentData();
                    break;
                default:
                    setLoading(false);
            }
        } else {
            setLoading(false);
            setError('User not logged in or token missing.');
        }
    }, [userInfo, userToken, fetchAdminData, fetchTeacherData, fetchStudentData, fetchParentData]);

    if (!userInfo) {
        return (
            <div className="text-center text-gray-600 p-8">
                <p>Please log in to view your dashboard. 🔑</p>
                <Link to="/login" className="text-blue-600 hover:underline mt-4 block">Go to Login</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center text-blue-800 p-8">
                <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
                <p className="text-lg">Loading your dashboard data... ⏳</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-8">
                <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p className="text-lg">Error: {error} 😟</p>
                <p className="text-sm text-gray-500 mt-2">Please try refreshing the page or contact support.</p>
            </div>
        );
    }

    const renderAdminDashboard = () => (
        adminData && (
            <>
                <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                    <h2 className="text-3xl font-bold text-blue-900 mb-6">Admin Overview 📊</h2>
                    <p className="text-gray-700 mb-8">
                        Welcome back, <span className="font-semibold">{userInfo.firstName}</span>! Here's a quick look at your college's status.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold mb-2">Total Users</h3>
                            <p className="text-4xl font-extrabold">{adminData.totalUsers}</p>
                            <Link to="/dashboard/users" className="text-blue-200 hover:underline text-sm mt-2 block">
                                Manage Users <i className="fas fa-arrow-right ml-1"></i>
                            </Link>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold mb-2">Active Courses</h3>
                            <p className="text-4xl font-extrabold">{adminData.activeCourses}</p>
                            <Link to="/dashboard/courses" className="text-green-200 hover:underline text-sm mt-2 block">
                                View Courses <i className="fas fa-arrow-right ml-1"></i>
                            </Link>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold mb-2">Enrolled Students</h3>
                            <p className="text-4xl font-extrabold">{adminData.enrolledStudents}</p>
                            <Link to="/dashboard/students" className="text-purple-200 hover:underline text-sm mt-2 block">
                                Manage Students <i className="fas fa-arrow-right ml-1"></i>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-10">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Quick Actions ⚡</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex items-center justify-center h-24">
                            <button
                                onClick={() => setIsAddUserModalOpen(true)}
                                className="text-blue-700 font-semibold text-center"
                            >
                                <i className="fas fa-user-plus text-2xl block mb-1"></i> Add New User
                            </button>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex items-center justify-center h-24">
                            <button
                                onClick={() => {
                                    setSelectedCourse(null); // Ensure it's in create mode
                                    setIsCourseModalOpen(true);
                                }}
                                className="text-green-700 font-semibold text-center"
                            >
                                <i className="fas fa-plus-square text-2xl block mb-1"></i> Create Course
                            </button>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex items-center justify-center h-24">
                            <Link to="/dashboard/announcements" className="text-red-700 font-semibold text-center">
                                <i className="fas fa-bullhorn text-2xl block mb-1"></i> Send Announcement
                            </Link>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex items-center justify-center h-24">
                            <Link to="/dashboard/settings" className="text-purple-700 font-semibold text-center">
                                <i className="fas fa-cog text-2xl block mb-1"></i> System Settings
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Add the new AddUserModal here */}
                <AddUserModal
                    isOpen={isAddUserModalOpen}
                    onClose={() => setIsAddUserModalOpen(false)}
                    onAddUser={handleAddNewUser}
                    errorMessage={addUserError}
                    isLoading={isAddingUser}
                />

                {/* ADDED THE COURSE FORM MODAL HERE */}
                <CourseFormModal
                    isOpen={isCourseModalOpen}
                    onClose={() => setIsCourseModalOpen(false)}
                    courseToEdit={selectedCourse} // Will be null for new course, which is correct
                    onSave={handleSaveCourse}
                />
            </>
        )
    );

    const renderTeacherDashboard = () => (
        teacherData && (
            <>
                <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                    <h2 className="text-3xl font-bold text-blue-900 mb-6">Teacher Overview 🍎</h2>
                    <p className="text-gray-700 mb-8">
                        Hello, <span className="font-semibold">{userInfo!.firstName}</span>! Here's your teaching summary.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <motion.div variants={itemVariants} className="bg-indigo-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold mb-2">My Active Courses</h3>
                            <p className="text-4xl font-extrabold">{teacherData.myActiveCourses}</p>
                            <Link to="/dashboard/teacher-courses" className="text-indigo-200 hover:underline text-sm mt-2 block">
                                View Courses <i className="fas fa-arrow-right ml-1"></i>
                            </Link>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-teal-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold mb-2">Students Taught</h3>
                            <p className="text-4xl font-extrabold">{teacherData.studentsTaught}</p>
                            <Link to="/dashboard/teacher-students" className="text-teal-200 hover:underline text-sm mt-2 block">
                                View My Students <i className="fas fa-arrow-right ml-1"></i>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-10">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Quick Links 🔗</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex items-center justify-center h-24">
                            <Link to="/dashboard/teacher-gradebook" className="text-blue-700 font-semibold text-center">
                                <i className="fas fa-clipboard-list text-2xl block mb-1"></i> Gradebook
                            </Link>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex items-center justify-center h-24">
                            <Link to="/dashboard/teacher-attendance" className="text-green-700 font-semibold text-center">
                                <i className="fas fa-user-check text-2xl block mb-1"></i> Record Attendance
                            </Link>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex items-center justify-center h-24">
                            <Link to="/dashboard/announcements" className="text-red-700 font-semibold text-center">
                                <i className="fas fa-bullhorn text-2xl block mb-1"></i> Announcements
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </>
        )
    );

    const renderStudentDashboard = () => (
        studentData && (
            <>
                <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                    <h2 className="text-3xl font-bold text-blue-900 mb-6">Student Overview 🎓</h2>
                    <p className="text-gray-700 mb-8">
                        Welcome, <span className="font-semibold">{userInfo!.firstName}</span>! Here's your academic snapshot.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <motion.div variants={itemVariants} className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold mb-2">Enrolled Courses</h3>
                            <p className="text-4xl font-extrabold">{studentData.enrolledCourses}</p>
                            <Link to="/dashboard/student-course" className="text-purple-200 hover:underline text-sm mt-2 block">
                                View My Courses <i className="fas fa-arrow-right ml-1"></i>
                            </Link>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-orange-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-xl font-semibold mb-2">Overall GPA</h3>
                            <p className="text-4xl font-extrabold">{studentData.overallGPA.toFixed(1)}</p>
                            <Link to="/dashboard/student-grades" className="text-orange-200 hover:underline text-sm mt-2 block">
                                View Grades <i className="fas fa-arrow-right ml-1"></i>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-10">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Upcoming Deadlines 📅</h3>
                    <div className="bg-gray-50 p-6 rounded-lg shadow">
                        <ul className="space-y-3">
                            {studentData.upcomingDeadlines.length > 0 ? (
                                studentData.upcomingDeadlines.map((deadline, index) => (
                                    <motion.li variants={itemVariants} key={index} className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200">
                                        <span>{deadline.course} - {deadline.title}</span>
                                        <span className="font-semibold text-sm text-red-600">Due: {deadline.dueDate}</span>
                                    </motion.li>
                                ))
                            ) : (
                                <p className="text-gray-600">No upcoming deadlines! 🎉</p>
                            )}
                        </ul>
                    </div>
                </motion.div>
            </>
        )
    );

    const renderParentDashboard = () => (
        parentData && (
            <>
                <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                    <h2 className="text-3xl font-bold text-blue-900 mb-6">Parent Overview 👨‍👩‍👧‍👦</h2>
                    <p className="text-gray-700 mb-8">
                        Welcome, <span className="font-semibold">{userInfo!.firstName}</span>! Here's a summary of your children's academic progress.
                    </p>

                    <h3 className="text-2xl font-bold text-blue-900 mb-4">My Children 👧👦</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {parentData.children.length > 0 ? (
                            parentData.children.map((child) => {
                                // Safely get initials for avatar
                                const firstInitial = child.firstName?.[0] || '';
                                const lastInitial = child.lastName?.[0] || '';
                                const initials = firstInitial + lastInitial;

                                // Safely get grade average and attendance percentage, ensuring they are numbers
                                const displayGradeAverage = typeof child.gradeAverage === 'number' ? child.gradeAverage : null;
                                const displayAttendancePercentage = typeof child.attendancePercentage === 'number' ? child.attendancePercentage : null;

                                // Determine grade letter
                                const getGradeLetter = (average: number | null) => {
                                    if (average === null) return 'N/A'; // If grade is null, display N/A
                                    if (average >= 90) return 'A+';
                                    if (average >= 80) return 'A-';
                                    if (average >= 70) return 'C+';
                                    return 'F';
                                };

                                return (
                                    <motion.div variants={itemVariants} key={child._id} className="bg-white p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-xl transition-shadow duration-300">
                                        <div className="flex items-center mb-4">
                                            <img
                                                src={child.avatarUrl || `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRISxBTQ88B9PvlreCwRY0_wqZK7y4XoG4zIQ&s${initials}`}
                                                alt={`${child.firstName || 'Unknown'} ${child.lastName || ''} Avatar`}
                                                className="w-16 h-16 rounded-full object-cover mr-4"
                                            />
                                            <div>
                                                <h4 className="text-xl font-semibold text-blue-900">{child.firstName || 'Unknown'} {child.lastName || ''}</h4>
                                                <p className="text-gray-600 text-sm">Student ID: {child.studentId || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 mb-3">
                                            <span className="font-medium">Current Grade Average:</span>{' '}
                                            <span className={`font-bold ${displayGradeAverage !== null && displayGradeAverage >= 80 ? 'text-green-600' : displayGradeAverage !== null && displayGradeAverage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {displayGradeAverage !== null ? `${displayGradeAverage}%` : 'N/A'} ({getGradeLetter(displayGradeAverage)})
                                            </span>
                                        </p>
                                        <p className="text-gray-700 mb-4">
                                            <span className="font-medium">Attendance:</span>{' '}
                                            <span className="font-bold text-blue-600">
                                                {displayAttendancePercentage !== null ? `${displayAttendancePercentage}%` : 'N/A'}
                                            </span>
                                        </p>
                                        {/* Links correctly point to child._id */}
                                        <Link to={`/dashboard/child/${child._id}/grades`} className="text-blue-600 hover:underline text-sm mr-4">
                                            View Grades <i className="fas fa-external-link-alt ml-1"></i>
                                        </Link>
                                        <Link to={`/dashboard/child/${child._id}/attendance`} className="text-blue-600 hover:underline text-sm">
                                            View Attendance <i className="fas fa-external-link-alt ml-1"></i>
                                        </Link>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <p className="text-gray-600 col-span-full">No children linked to this account. 😟</p>
                        )}
                    </div>
                </motion.div>

                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-10">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Important Announcements 📢</h3>
                    <div className="bg-gray-50 p-6 rounded-lg shadow">
                        <ul className="space-y-3">
                            {parentData.importantAnnouncements.length > 0 ? (
                                parentData.importantAnnouncements.map((announcement, index) => (
                                    <motion.li variants={itemVariants} key={index} className="py-2 border-b last:border-b-0 border-gray-200">
                                        <p className="font-semibold text-blue-800">{announcement.title}</p>
                                        <p className="text-gray-700 text-sm">{announcement.content}</p>
                                    </motion.li>
                                ))
                            ) : (
                                <p className="text-gray-600">No recent announcements. ℹ️</p>
                            )}
                        </ul>
                        <Link to="/dashboard/announcements" className="text-blue-600 hover:underline text-sm mt-4 block text-right">
                            View All Announcements <i className="fas fa-long-arrow-alt-right ml-1"></i>
                        </Link>
                    </div>
                </motion.div>
            </>
        )
    );

    const renderDashboardContent = () => {
        switch (userInfo.role) {
            case 'admin':
                return renderAdminDashboard();
            case 'teacher':
                return renderTeacherDashboard();
            case 'student':
                return renderStudentDashboard();
            case 'parent':
                return renderParentDashboard();
            default:
                return (
                    <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                        <h2 className="text-3xl font-bold text-blue-900 mb-6">Welcome to Your Dashboard! 👋</h2>
                        <p className="text-gray-700">
                            You are logged in as a <span className="font-semibold">{userInfo.role}</span>.
                            Content tailored to your role will appear here.
                        </p>
                    </motion.div>
                );
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {renderDashboardContent()}
        </div>
    );
};

export default DashboardOverview;