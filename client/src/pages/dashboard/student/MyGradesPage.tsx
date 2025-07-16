// src/pages/dashboard/student/MyGradesPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [grades, setGrades] = useState<Grade[]>([]);
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
        const response = await axios.get('http://localhost:5000/api/students/me/grades', {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        setGrades(response.data);
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

  if (loading) return <p className="text-center py-10 text-gray-600">Loading grades...</p>;
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
  if (grades.length === 0) return <p className="text-center py-10 text-gray-500">No grades available yet.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-blue-800">My Grades</h2>
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
                  {new Date(grade.dateGraded).toLocaleDateString()}
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

export default MyGradesPage;
