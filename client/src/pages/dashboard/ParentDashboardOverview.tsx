// src/pages/dashboard/parent/ParentDashboardOverview.tsx
import React, { useState, useEffect } from 'react';
import { motion, easeOut } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Define parentData interface for clarity
interface ChildSummary {
  _id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  gpa?: number; // Assume GPA is a number
  attendancePercentage?: number; // Assume attendance is a number
  letterGrade?: string; // Assume letter grade is a string
  avatarUrl?: string; // This is the field that should contain the direct avatar URL
}

interface Announcement { // Define an interface for Announcement
  title: string;
  content: string;
  date: string;
}

interface ParentDashboardData {
  children: ChildSummary[];
  importantAnnouncements?: Announcement[]; // Use the Announcement interface
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

const ParentDashboardOverview: React.FC = () => {
  const { userInfo } = useAuth();
  const [parentData, setParentData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParentSummary = async () => {
      if (!userInfo?.token || !userInfo?._id) {
        setError('Authentication required to fetch parent data.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
          withCredentials: true,
        };

        // ⭐ FIXED: Using distinct variable names for each API call ⭐
        const childrenSummaryResponse = await axios.get(`https://studyhabitcollege.onrender.com/api/parents/me/summary`, config);
        const announcementsResponse = await axios.get(`https://studyhabitcollege.onrender.com/api/announcements`, config);

        // ⭐ Combine data from both responses into the ParentDashboardData structure ⭐
        setParentData({
          children: childrenSummaryResponse.data.children || [], // Assumes children are in a 'children' property
          importantAnnouncements: announcementsResponse.data || [], // Assumes announcements are directly the response data
        });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching parent overview data:', err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to load parent overview data. Please try again.');
        // Set to empty arrays to prevent rendering errors if data is missing
        setParentData({ children: [], importantAnnouncements: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchParentSummary();
  }, [userInfo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading your parent overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
      >
        <p className="text-xl font-semibold mb-2 flex items-center justify-center">
          <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Parent Overview!
        </p>
        <p>{error}</p>
      </motion.div>
    );
  }

  if (!parentData) {
    // This case ideally shouldn't be reached if `setParentData` always sets an object,
    // even an empty one, in the catch block. But it's a good safeguard.
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="text-center py-10 bg-blue-50 rounded-lg shadow-inner border border-blue-200"
      >
        <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
          <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Parent Data Available!
        </p>
        <p className="text-gray-600">
          We could not load your parent dashboard data. Please ensure your account is correctly set up.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="parent-dashboard-overview p-4 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">Parent Overview 👨‍👩‍👧‍👦</h2>
      <p className="text-gray-700 mb-8">
        Welcome, <span className="font-semibold">{userInfo?.firstName || 'Parent'}</span>! Here's a quick summary of your children's academic standing and important updates.
      </p>

      <motion.div variants={sectionVariants}>
  <h3 className="text-2xl font-bold text-blue-900 mb-4">
    {parentData.children.length === 1 ? 'My Child Summary 👧👦' : 'My Children Summary 👧👦'}
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    {parentData.children.length > 0 ? (
      parentData.children.slice(0, 2).map((child) => { // Display a few children summary

        const displayGPA = typeof child.gpa === 'number' ? child.gpa : null;
        const displayAttendancePercentage = typeof child.attendancePercentage === 'number' ? child.attendancePercentage : null;
        const displayLetterGrade = child.letterGrade || 'N/A';

        return (
          <motion.div variants={itemVariants} key={child._id} className="bg-white p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <img
                src={child.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(child.firstName + ' ' + child.lastName)}&chars=2&fontFamily=Arial,sans-serif&fontWeight=600`}
                alt={`${child.firstName || 'Unknown'} ${child.lastName || ''} Avatar`}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="text-xl font-semibold text-blue-900">{child.firstName || 'Unknown'} {child.lastName || ''}</h4>
                <p className="text-gray-600 text-sm">Student ID: {child.studentId || 'N/A'}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">
              <span className="font-medium">Overall GPA:</span>{' '}
              <span className={`font-bold ${displayGPA !== null && displayGPA >= 3.0 ? 'text-green-600' : displayGPA !== null && displayGPA >= 2.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {displayGPA !== null ? displayGPA.toFixed(2) : 'N/A'} ({displayLetterGrade})
              </span>
            </p>
            <p className="text-gray-700 mb-4">
              <span className="font-medium">Attendance:</span>{' '}
              <span className="font-bold text-blue-600">
                {displayAttendancePercentage !== null ? `${displayAttendancePercentage}%` : 'N/A'}
              </span>
            </p>
            <Link to={`/dashboard/children/${child._id}/grades`} className="text-blue-600 hover:underline text-sm">
                View Full Details <i className="fas fa-external-link-alt ml-1"></i>
            </Link>
          </motion.div>
        );
      })
    ) : (
      <p className="text-gray-600 col-span-full">No children linked to this account. 😟</p>
    )}
  </div>
  <Link to="/dashboard/children" className="text-blue-600 hover:underline text-md font-semibold mt-4 block text-center">
  {parentData.children.length === 1 ? "View Your Child's Records" : "View All Children's Records"}{' '}
  <i className="fas fa-arrow-right ml-2"></i>
</Link>
</motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-10">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">Important Announcements 📢</h3>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <ul className="space-y-3">
            {parentData.importantAnnouncements && parentData.importantAnnouncements.length > 0 ? (
              parentData.importantAnnouncements.map((announcement, index) => (
                <motion.li variants={itemVariants} key={index} className="py-2 border-b last:border-b-0 border-gray-200">
                  <p className="font-semibold text-blue-800">{announcement.title}</p>
                  <p className="text-gray-700 text-sm">{announcement.content}</p>
                  {announcement.date && (
                    <p className="text-gray-500 text-xs mt-1">Date: {new Date(announcement.date).toLocaleDateString()}</p>
                  )}
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
    </motion.div>
  );
};

export default ParentDashboardOverview;