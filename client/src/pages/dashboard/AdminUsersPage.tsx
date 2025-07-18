/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/AdminUsersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, type Variants } from 'framer-motion'; // Import Variants
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

  // Framer Motion Variants for page entry
  const pageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }, // Using easeOut cubic-bezier
  };

  // Framer Motion Variants for table rows (optional, but good for subtle effect)
  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const fetchUsers = useCallback(async () => {
    if (!userInfo?.token || userInfo.role !== 'admin') {
      setError('You are not authorized to view this page. Admin access required.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('https://studyhabitcollege.onrender.com/api/users', config);
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token, userInfo?.role]);

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
      setError('User not authenticated for this action.');
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
      setIsModalOpen(false);
      alert('User updated successfully!');
    } catch (err: any) {
      console.error('Failed to update user:', err);
      alert(`Error updating user: ${err.response?.data?.message || 'Please try again.'}`);
      throw new Error(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!userInfo?.token || userInfo.role !== 'admin') {
      alert('You are not authorized to delete users.');
      return;
    }
    if (userInfo._id === userId) {
      alert('You cannot delete your own account.');
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
        alert('User deleted successfully!');
      } catch (err: any) {
        console.error('Error deleting user:', err);
        setError(err.response?.data?.message || 'Failed to delete user.');
        alert(`Error deleting user: ${err.response?.data?.message || 'Please try again.'}`);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="admin-users-page p-4 sm:p-6 md:p-8 bg-gray-50 min-h-full font-sans antialiased text-gray-800 rounded-lg shadow-inner"
    >
      {/* Page Header */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4 flex items-center">
        <i className="fas fa-users-cog mr-3 text-indigo-600"></i> Manage Users
      </h2>
      <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl">
        As an administrator, you can view, edit, and delete user accounts. Ensure user roles are correctly assigned for proper system access.
      </p>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-lg border border-blue-100 animate-pulse-fade">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Fetching user data... Please wait. 🔄</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 px-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl shadow-md">
          <p className="text-2xl font-bold mb-3 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i> Error!
          </p>
          <p className="text-lg mb-4">{error}</p>
          <p className="text-md text-red-700 font-semibold">
            Please check your network connection or contact support if the issue persists.
          </p>
          <button
            onClick={fetchUsers}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md flex items-center justify-center mx-auto"
          >
            <i className="fas fa-redo-alt mr-2"></i> Retry
          </button>
        </div>
      )}

      {/* No Users Found State */}
      {!loading && !error && users.length === 0 && (
        <div className="text-center py-12 px-6 bg-blue-50 rounded-xl shadow-inner border-2 border-blue-200">
          <p className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center">
            <i className="fas fa-info-circle mr-3 text-blue-500"></i> No Users Found
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            It looks like there are no users registered in the system yet.
          </p>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && users.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal table-auto">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Registered On
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial="hidden"
                      animate="visible"
                      variants={rowVariants}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                      className="border-b border-gray-100 hover:bg-blue-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-sm">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-gray-900 font-medium">{user.firstName} {user.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 font-semibold text-xs rounded-full shadow-sm
                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800'
                              : user.role === 'teacher' ? 'bg-green-100 text-green-800'
                                : user.role === 'student' ? 'bg-blue-100 text-blue-800'
                                  : user.role === 'parent' ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium mr-3 transition duration-150 ease-in-out
                          disabled:opacity-40 disabled:cursor-not-allowed disabled:text-gray-500"
                          disabled={userInfo?._id === user._id}
                          title={userInfo?._id === user._id ? "Cannot edit your own account here" : "Edit user"}
                        >
                          <i className="fas fa-edit mr-1"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                          className="text-red-600 hover:text-red-800 font-medium transition duration-150 ease-in-out
                          disabled:opacity-40 disabled:cursor-not-allowed disabled:text-gray-500"
                          disabled={userInfo?._id === user._id || deleteLoading === user._id}
                          title={userInfo?._id === user._id ? "Cannot delete your own account" : "Delete user"}
                        >
                          {deleteLoading === user._id ? (
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                          ) : (
                            <i className="fas fa-trash-alt mr-1"></i>
                          )}
                          {deleteLoading === user._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

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