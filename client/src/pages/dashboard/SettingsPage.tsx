// src/pages/dashboard/SettingsPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; // Assuming AuthContext has user info
import ProfileSettings from '../../components/dashboard/settings/ProfileSettings';
import PasswordSettings from '../../components/dashboard/settings/PasswordSettings';
// You can add more settings components here, e.g., NotificationSettings, SecuritySettings

const SettingsPage: React.FC = () => {
  const { userInfo } = useAuth(); // Get user info from context

  // State to manage active tab/section
  const [activeTab, setActiveTab] = useState('profile');

  if (!userInfo) {
    return (
      <div className="text-center py-10 text-gray-600">
        Please log in to view settings.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="settings-page p-6 bg-gray-100 min-h-screen"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Settings</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar for Navigation */}
        <div className="md:w-1/4 bg-white rounded-lg shadow p-4">
          <nav>
            <button
              onClick={() => setActiveTab('profile')}
              className={`block w-full text-left py-2 px-4 rounded-md mb-2 transition-colors
                ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <i className="fas fa-user-circle mr-2"></i> Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`block w-full text-left py-2 px-4 rounded-md mb-2 transition-colors
                ${activeTab === 'password' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <i className="fas fa-key mr-2"></i> Password
            </button>
            {/* Add more buttons for other settings sections */}
            {/*
            <button
              onClick={() => setActiveTab('notifications')}
              className={`block w-full text-left py-2 px-4 rounded-md mb-2 transition-colors
                ${activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <i className="fas fa-bell mr-2"></i> Notifications
            </button>
            */}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="md:w-3/4 bg-white rounded-lg shadow p-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'password' && <PasswordSettings />}
          {/* Render other settings components based on activeTab */}
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;