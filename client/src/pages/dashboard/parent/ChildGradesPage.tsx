/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
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

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        };

        const response = await axios.get(`https://studyhabitcollege.onrender.com/api/parents/child/${studentId}/grades`, config);
        
        const flatGrades: Grade[] = response.data.map((g: any) => ({
  _id: g._id,
  courseName: g.course?.name || 'Unknown',
  courseCode: g.course?.code || 'N/A',
  assignmentName: g.assignmentName || 'Unnamed', // ✅ now correctly uses backend key
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
        console.error('Error fetching child grades:', err);
        setError(err.response?.data?.message || 'Failed to load grades.');
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) fetchGrades();
  }, [studentId, userInfo]);

  if (loading) return <p className="text-center py-10 text-gray-600">Loading grades...</p>;
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
  if (grades.length === 0) return <p className="text-center py-10 text-gray-500">No grades available yet.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-blue-800">Grades</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Course</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Assignment</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Score</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Percentage</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Date Graded</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade._id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 text-sm text-gray-800">
                  {grade.courseName} ({grade.courseCode})
                </td>
                <td className="py-2 px-4 text-sm text-gray-800">{grade.assignmentName}</td>
                <td className="py-2 px-4 text-sm text-gray-800">
                  {grade.score}/{grade.maxScore}
                </td>
                <td className="py-2 px-4 text-sm font-medium text-gray-900">
                  {grade.percentage}
                </td>
                <td className="py-2 px-4 text-sm text-gray-800">
                  {grade.dateGraded
                    ? new Date(grade.dateGraded).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </td>
                <td className="py-2 px-4 text-sm text-gray-600">
                  {grade.feedback || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChildGradesPage;
