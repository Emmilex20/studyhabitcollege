// src/pages/dashboard/student/MyGradesPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, easeOut } from 'framer-motion'; // Import easeOut
import { useAuth } from '../../../context/AuthContext';

interface Grade {
  _id: string;
  courseName: string;
  courseCode: string;
  assignmentName: string;
  score: number;
  maxScore: number;
  percentage: string;
  dateGraded: string;
  feedback?: string;
}

const MyGradesPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]!);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!userInfo?.token || userInfo.role !== 'student') {
        setError('You must be logged in as a student to view your grades.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('https://studyhabitcollege.onrender.com/api/students/me/grades', {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        const data = response.data;
        if (Array.isArray(data)) {
          setGrades(data);
        } else if (data && Array.isArray(data.grades)) {
          setGrades(data.grades);
        } else {
          setGrades([]);
        }
        setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching grades:', err);
        setError(err.response?.data?.message || 'Failed to load grades. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [userInfo]);

  // Animation variants for the whole page
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } }, // Changed 'easeOut' to easeOut variable
  };

  // Animation variants for table rows
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading your grades... <span className="italic">This might take a moment.</span></p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="text-center py-10 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
      >
        <p className="text-xl font-semibold mb-2 flex items-center justify-center">
          <i className="fas fa-exclamation-triangle mr-3 text-red-500"></i> Error Loading Grades!
        </p>
        <p>{error}</p>
        <p className="text-sm mt-3 text-red-500">Please ensure you are logged in correctly and try refreshing the page.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="my-grades-page p-4 sm:p-0"
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-award mr-3 text-yellow-500"></i> My Grades
      </h2>
      <p className="text-gray-700 mb-8 text-lg">
        Here's a detailed overview of your academic performance. Keep track of your scores and feedback.
      </p>

      {grades.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 bg-blue-50 rounded-lg shadow-inner border border-blue-200"
        >
          <p className="text-xl font-semibold text-blue-600 mb-3 flex items-center justify-center">
            <i className="fas fa-clipboard-list mr-3 text-blue-500"></i> No Grades Available Yet!
          </p>
          <p className="text-gray-600">
            Your instructors haven't posted any grades for you yet. Please check back later.
          </p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-book mr-2"></i> Course
                </th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <i className="fas fa-tasks mr-2"></i> Assignment
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
              {grades.map((grade, index) => (
                <motion.tr
                  key={grade._id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  whileHover={{ backgroundColor: '#f3f4f6', scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                  className="hover:shadow-sm"
                >
                  <td className="py-3 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                    {grade.courseName} <span className="text-gray-500">({grade.courseCode})</span>
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm text-gray-700">{grade.assignmentName}</td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm text-gray-700">
                    <span className="font-semibold text-blue-600">{grade.score}</span> / {grade.maxScore}
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm font-bold">
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                        parseFloat(grade.percentage) >= 70 ? 'bg-green-100 text-green-800' :
                        parseFloat(grade.percentage) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {grade.percentage}
                    </span>
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-sm text-gray-700">
                    {new Date(grade.dateGraded).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600 max-w-xs truncate lg:whitespace-normal">
                    {grade.feedback ? (
                      <span className="tooltip-container relative group"> {/* Added 'group' class here */}
                        {grade.feedback}
                        <span className="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 p-2 bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 w-48 text-center">
                          {grade.feedback}
                        </span>
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default MyGradesPage;