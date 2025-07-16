/* eslint-disable no-irregular-whitespace */
// src/pages/dashboard/DashboardOverview.tsx
import React from 'react';
import { motion, easeOut } from 'framer-motion'; // <-- Import easeOut here
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import { Link } from 'react-router-dom';

const DashboardOverview: React.FC = () => {
  const { userInfo } = useAuth();

  // Variants for section animations
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut }, // <-- Use the imported easeOut
    },
  };

  // Variants for individual cards/items
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: easeOut }, // <-- Use the imported easeOut
    },
  };

  if (!userInfo) {
    return (
      <div className="text-center text-gray-600">
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <>
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Admin Overview</h2>
        <p className="text-gray-700 mb-8">
          Welcome back, <span className="font-semibold">{userInfo.firstName}</span>! Here's a quick look at your college's status.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Total Users</h3>
            <p className="text-4xl font-extrabold">1200+</p>
            <Link to="/dashboard/users" className="text-blue-200 hover:underline text-sm mt-2 block">
              Manage Users <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Active Courses</h3>
            <p className="text-4xl font-extrabold">75</p>
            <Link to="/dashboard/courses" className="text-green-200 hover:underline text-sm mt-2 block">
              View Courses <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Enrolled Students</h3>
            <p className="text-4xl font-extrabold">850</p>
            <Link to="/dashboard/students" className="text-purple-200 hover:underline text-sm mt-2 block">
              Manage Students <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-10">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex items-center justify-center h-24">
            <Link to="/dashboard/users/new" className="text-blue-700 font-semibold text-center">
              <i className="fas fa-user-plus text-2xl block mb-1"></i> Add New User
            </Link>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex items-center justify-center h-24">
            <Link to="/dashboard/courses/new" className="text-green-700 font-semibold text-center">
              <i className="fas fa-plus-square text-2xl block mb-1"></i> Create Course
            </Link>
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
    </>
  );

  const renderTeacherDashboard = () => (
    <>
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Teacher Overview</h2>
        <p className="text-gray-700 mb-8">
          Hello, <span className="font-semibold">{userInfo.firstName}</span>! Here's your teaching summary.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants} className="bg-indigo-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">My Active Courses</h3>
            <p className="text-4xl font-extrabold">3</p> {/* Replace with dynamic data */}
            <Link to="/dashboard/teacher-courses" className="text-indigo-200 hover:underline text-sm mt-2 block">
              View Courses <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-teal-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Students Taught</h3>
            <p className="text-4xl font-extrabold">95</p> {/* Replace with dynamic data */}
            <Link to="/dashboard/teacher-students" className="text-teal-200 hover:underline text-sm mt-2 block">
              View My Students <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-10">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">Quick Links</h3>
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
  );

  const renderStudentDashboard = () => (
    <>
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Student Overview</h2>
        <p className="text-gray-700 mb-8">
          Welcome, <span className="font-semibold">{userInfo.firstName}</span>! Here's your academic snapshot.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants} className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Enrolled Courses</h3>
            <p className="text-4xl font-extrabold">5</p> {/* Replace with dynamic data */}
            <Link to="/dashboard/student-course" className="text-purple-200 hover:underline text-sm mt-2 block">
              View My Courses <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-orange-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Overall GPA</h3>
            <p className="text-4xl font-extrabold">3.8</p> {/* Replace with dynamic data */}
            <Link to="/dashboard/student-grades" className="text-orange-200 hover:underline text-sm mt-2 block">
              View Grades <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-10">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">Upcoming Deadlines</h3>
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          {/* Replace with actual upcoming assignments/deadlines */}
          <ul className="space-y-3">
            <motion.li variants={itemVariants} className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200">
              <span>Mathematics - Assignment 3</span>
              <span className="font-semibold text-sm text-red-600">Due: July 20</span>
            </motion.li>
            <motion.li variants={itemVariants} className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200">
              <span>Physics - Lab Report</span>
              <span className="font-semibold text-sm text-red-600">Due: July 25</span>
            </motion.li>
            <motion.li variants={itemVariants} className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200">
              <span>History - Research Paper</span>
              <span className="font-semibold text-sm text-red-600">Due: August 5</span>
            </motion.li>
          </ul>
        </div>
      </motion.div>
    </>
  );

  const renderParentDashboard = () => (
    <>
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Parent Overview</h2>
        <p className="text-gray-700 mb-8">
          Welcome, <span className="font-semibold">{userInfo.firstName}</span>! Here's a summary of your children's academic progress.
        </p>

        <h3 className="text-2xl font-bold text-blue-900 mb-4">My Children</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Example child card - replace with dynamic children data */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <img src="https://via.placeholder.com/60/9CA3AF/FFFFFF?text=Child" alt="Child Avatar" className="w-16 h-16 rounded-full object-cover mr-4" />
              <div>
                <h4 className="text-xl font-semibold text-blue-900">Adebayo Okoro</h4>
                <p className="text-gray-600 text-sm">Student ID: S001</p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">
              <span className="font-medium">Current Grade Average:</span> <span className="font-bold text-green-600">88% (A-)</span>
            </p>
            <p className="text-gray-700 mb-4">
              <span className="font-medium">Attendance:</span> <span className="font-bold text-blue-600">95%</span>
            </p>
            <Link to="/dashboard/child/S001/grades" className="text-blue-600 hover:underline text-sm mr-4">
              View Grades <i className="fas fa-external-link-alt ml-1"></i>
            </Link>
            <Link to="/dashboard/child/S001/attendance" className="text-blue-600 hover:underline text-sm">
              View Attendance <i className="fas fa-external-link-alt ml-1"></i>
            </Link>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <img src="https://via.placeholder.com/60/9CA3AF/FFFFFF?text=Child" alt="Child Avatar" className="w-16 h-16 rounded-full object-cover mr-4" />
              <div>
                <h4 className="text-xl font-semibold text-blue-900">Fatima Adebayo</h4>
                <p className="text-gray-600 text-sm">Student ID: S002</p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">
              <span className="font-medium">Current Grade Average:</span> <span className="font-bold text-yellow-600">75% (C+)</span>
            </p>
            <p className="text-gray-700 mb-4">
              <span className="font-medium">Attendance:</span> <span className="font-bold text-blue-600">92%</span>
            </p>
            <Link to="/dashboard/child/S002/grades" className="text-blue-600 hover:underline text-sm mr-4">
              View Grades <i className="fas fa-external-link-alt ml-1"></i>
            </Link>
            <Link to="/dashboard/child/S002/attendance" className="text-blue-600 hover:underline text-sm">
              View Attendance <i className="fas fa-external-link-alt ml-1"></i>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-10">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">Important Announcements</h3>
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          {/* Replace with actual announcements */}
          <ul className="space-y-3">
            <motion.li variants={itemVariants} className="py-2 border-b last:border-b-0 border-gray-200">
              <p className="font-semibold text-blue-800">School Holiday Notice</p>
              <p className="text-gray-700 text-sm">The college will be closed on July 26th for National Youth Day.</p>
            </motion.li>
            <motion.li variants={itemVariants} className="py-2 border-b last:border-b-0 border-gray-200">
              <p className="font-semibold text-blue-800">Parent-Teacher Conference</p>
              <p className="text-gray-700 text-sm">Schedule your slot for the upcoming PTC on August 10-12.</p>
            </motion.li>
          </ul>
          <Link to="/dashboard/announcements" className="text-blue-600 hover:underline text-sm mt-4 block text-right">
            View All Announcements <i className="fas fa-long-arrow-alt-right ml-1"></i>
          </Link>
        </div>
      </motion.div>
    </>
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
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Welcome to Your Dashboard!</h2>
            <p className="text-gray-700">
              You are logged in as a <span className="font-semibold">{userInfo.role}</span>.
              Content tailored to your role will appear here.
            </p>
          </motion.div>
        );
    }
  };

  return (
    <>
      {renderDashboardContent()}
    </>
  );
};

export default DashboardOverview;