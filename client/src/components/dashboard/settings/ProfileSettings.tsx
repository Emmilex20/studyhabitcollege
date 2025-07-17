/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dashboard/settings/ProfileSettings.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify'; // Assuming you use react-toastify for notifications

const ProfileSettings: React.FC = () => {
  const { userInfo, setUserInfo } = useAuth();
  const [firstName, setFirstName] = useState(userInfo?.firstName || '');
  const [lastName, setLastName] = useState(userInfo?.lastName || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setFirstName(userInfo.firstName || '');
      setLastName(userInfo.lastName || '');
      setEmail(userInfo.email || '');
    }
  }, [userInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      const { data } = await axios.put(
        'https://studyhabitcollege.onrender.com/api/users/profile', // Your backend endpoint
        { firstName, lastName, email },
        config
      );

      // Update user info in AuthContext and localStorage
      setUserInfo({ ...userInfo, ...data });
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...data }));
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;