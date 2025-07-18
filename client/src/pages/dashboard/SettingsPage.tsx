// src/pages/dashboard/SettingsPage.tsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { motion, AnimatePresence, easeOut, easeIn } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from '../../components/dashboard/settings/ProfileSettings';
import PasswordSettings from '../../components/dashboard/settings/PasswordSettings';

interface TabButtonProps {
  tabName: string;
  activeTab: string;
  iconClass: string;
  label: string;
  onClick: (tab: string) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tabName, activeTab, iconClass, label, onClick }) => (
  <motion.button
    whileHover={{ x: 5 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(tabName)}
    className={`relative flex items-center w-full text-left py-3 px-4 rounded-lg mb-2 font-medium transition-all duration-300 ease-in-out
      ${activeTab === tabName
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-transparent hover:bg-blue-50 text-gray-700 hover:text-blue-700'
      }`}
  >
    <i className={`${iconClass} mr-3 text-lg ${activeTab === tabName ? 'text-white' : 'text-blue-500 group-hover:text-blue-700'}`}></i>
    {label}
    {activeTab === tabName && (
      <motion.span
        layoutId="activeTabIndicator"
        className="absolute left-0 top-0 h-full w-1 bg-yellow-400 rounded-l-lg"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </motion.button>
);


const SettingsPage: React.FC = () => {
  const { userInfo, loading: authLoading } = useAuth(); // Destructure loading from useAuth
  const [activeTab, setActiveTab] = useState('profile');
  const [pageLoaded, setPageLoaded] = useState(false); // New state to track if page content should render

  // Use useEffect to set pageLoaded to true once userInfo is available and authLoading is false
  useEffect(() => {
    if (!authLoading && userInfo) {
      setPageLoaded(true);
    }
  }, [authLoading, userInfo]);

  // Framer Motion variants for page entry
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  // Framer Motion variants for content section transitions
  const contentVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: easeIn } },
  };

  // Show a loading spinner while authentication info is being fetched
  if (authLoading || !pageLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-xl text-gray-600">Loading settings... ⚙️</p>
      </div>
    );
  }

  // If userInfo is still null/undefined after loading, show authentication required message
  if (!userInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-lg shadow-lg"
        >
          <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
          <p className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</p>
          <p className="text-gray-500">Please log in to view your settings.</p>
        </motion.div>
      </div>
    );
  }

  // Render the actual settings content once userInfo is available
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="settings-page p-4 sm:p-6 bg-gray-50 min-h-screen"
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-6 flex items-center">
        <i className="fas fa-cog mr-3 text-purple-500"></i> User Settings
      </h2>
      <p className="text-gray-700 mb-8 text-lg">
        Manage your profile information, change your password, and customize your preferences.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4 bg-white rounded-xl shadow-lg p-4 h-fit sticky top-6">
          <nav>
            <TabButton
              tabName="profile"
              activeTab={activeTab}
              iconClass="fas fa-user-circle"
              label="Profile Settings"
              onClick={setActiveTab}
            />
            <TabButton
              tabName="password"
              activeTab={activeTab}
              iconClass="fas fa-key"
              label="Password & Security"
              onClick={setActiveTab}
            />
            {/* Add more TabButtons for other settings sections */}
          </nav>
        </div>

        <div className="md:w-3/4 bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile-settings"
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <ProfileSettings />
              </motion.div>
            )}
            {activeTab === 'password' && (
              <motion.div
                key="password-settings"
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <PasswordSettings />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;