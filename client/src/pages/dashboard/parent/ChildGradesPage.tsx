/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/parent/ChildGradesPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // Import motion and AnimatePresence
import { useAuth } from '../../../context/AuthContext';

interface Grade {
  _id: string;
  courseName: string;
  courseCode: string;
  assignmentName: string; // derived from gradeType
  score: number;
  maxScore: number;
  percentage: string;
  dateGraded: string;
  feedback?: string;
}

const ChildGradesPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { userInfo } = useAuth();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!studentId) {
        setError('No student ID provided.');
        setLoading(false);
        return;
      }

      if (!userInfo?.token) {
        setError('Authentication required to fetch grades.');
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

        const response = await axios.get(`https://studyhabitcollege.onrender.com/api/parents/child/${studentId}/grades`, config);

        const flatGrades: Grade[] = response.data.map((g: any) => ({
          _id: g._id,
          courseName: g.course?.name || 'Unknown',
          courseCode: g.course?.code || 'N/A',
          assignmentName: g.assignmentName || 'Unnamed',
          score: g.score,
          maxScore: g.maxScore,
          percentage:
            g.maxScore && g.maxScore > 0
              ? `${((g.score / g.maxScore) * 100).toFixed(1)}%`
              : 'N/A',
          dateGraded: g.dateGraded,
          feedback: g.feedback || 'N/A',
        }));

        setGrades(flatGrades);
      } catch (err: any) {
        console.error('Error fetching child grades:', err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to load grades. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [studentId, userInfo]); // Add userInfo to dependencies to re-fetch if auth state changes

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.6,
        ease: easeOut,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const gradeRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-600">Fetching grades for your child...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
      >
        <p className="text-xl font-semibold mb-2 flex items-center justify-center">
          <i className="fas fa-exclamation-circle mr-3 text-red-500"></i> Error Loading Grades!
        </p>
        <p>{error}</p>
        <p className="text-sm mt-3 text-red-500">Please ensure the student ID is correct and you are logged in.</p>
      </motion.div>
    );
  }

  if (grades.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center py-10 bg-blue-50 rounded-lg shadow-inner border border-blue-200"
      >
        <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
          <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Grades Available Yet!
        </p>
        <p className="text-gray-600">
          It looks like your child doesn't have any grades recorded at the moment.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="child-grades-page p-4 bg-white rounded-lg shadow-xl border border-gray-100"
    >
      <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-graduation-cap mr-3 text-green-600"></i> Academic Performance
      </motion.h2>

      <motion.p variants={itemVariants} className="text-gray-700 mb-8 text-lg">
        Here you can view a detailed breakdown of your child's academic grades for each assignment across their courses.
      </motion.p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <i className="fas fa-book mr-2"></i> Course
              </th>
              <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <i className="fas fa-clipboard-list mr-2"></i> Assignment
              </th>
              <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <i className="fas fa-calculator mr-2"></i> Score
              </th>
              <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <i className="fas fa-percent mr-2"></i> Percentage
              </th>
              <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <i className="fas fa-calendar-alt mr-2"></i> Date Graded
              </th>
              <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <i className="fas fa-comment-dots mr-2"></i> Feedback
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            <AnimatePresence>
              {grades.map((grade) => (
                <motion.tr
                  key={grade._id}
                  variants={gradeRowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ backgroundColor: '#f3f4f6', scale: 1.005 }}
                  className="transition-all duration-150 ease-in-out"
                >
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <span className="font-semibold text-blue-700">{grade.courseName}</span>
                    <p className="text-xs text-gray-500">({grade.courseCode})</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-gray-800">
                    <span className="font-medium">{grade.assignmentName}</span>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-gray-800">
                    <span className="font-bold">{grade.score}</span> / {grade.maxScore}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <span className={`font-extrabold ${parseFloat(grade.percentage) >= 70 ? 'text-green-600' : parseFloat(grade.percentage) >= 50 ? 'text-orange-500' : 'text-red-600'}`}>
                      {grade.percentage}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-gray-800">
                    {grade.dateGraded
                      ? new Date(grade.dateGraded).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-gray-600 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {grade.feedback || 'No feedback provided.'}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ChildGradesPage;