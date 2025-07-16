/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminUsersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import EditUserModal from '../../components/modals/EditUserModal';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

const AdminUsersPage: React.FC = () => {
  const { userInfo, fetchUserProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
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
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/users', config);
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (
    userId: string,
    updatedData: { firstName?: string; lastName?: string; email?: string; role?: string }
  ) => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json',
        },
      };

      await axios.put(`https://studyhabitcollege.onrender.com/api/users/${userId}`, updatedData, config);
      await fetchUsers();

      if (userInfo._id === userId && updatedData.role) {
        await fetchUserProfile();
      }
    } catch (err: any) {
      console.error('Failed to update user:', err);
      throw new Error(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!userInfo?.token) {
      setError('User not authenticated.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user: ${userName}? This action cannot be undone.`)) {
      setDeleteLoading(userId);

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`https://studyhabitcollege.onrender.com/api/users/${userId}`, config);
        await fetchUsers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete user.');
        console.error(err);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="admin-users-page"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Manage Users</h2>
      <p className="text-gray-700 mb-4">View and manage all registered users in the system.</p>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Registered On
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.email}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      user.role === 'admin'
                        ? 'text-purple-900 bg-purple-200'
                        : user.role === 'teacher'
                        ? 'text-green-900 bg-green-200'
                        : user.role === 'student'
                        ? 'text-blue-900 bg-blue-200'
                        : 'text-gray-900 bg-gray-200'
                    } rounded-full`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={user._id === userInfo?._id}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={user._id === userInfo?._id || deleteLoading === user._id}
                  >
                    {deleteLoading === user._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </motion.div>
  );
};

export default AdminUsersPage;
