/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dashboard/settings/PasswordSettings.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

const PasswordSettings: React.FC = () => {
  const { userInfo } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      await axios.put(
        'https://studyhabitcollege.onrender.com/api/users/change-password', // Your backend endpoint
        { currentPassword, newPassword },
        config
      );

      toast.success('Password updated successfully!');
      // Clear fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
      console.error('Password update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-settings">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default PasswordSettings;