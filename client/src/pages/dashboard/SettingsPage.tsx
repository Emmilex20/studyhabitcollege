// src/pages/dashboard/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion'; // Import Variants for type safety
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from '../../components/dashboard/settings/ProfileSettings';
import PasswordSettings from '../../components/dashboard/settings/PasswordSettings';

// --- TabButton Component ---
interface TabButtonProps {
  tabName: string;
  activeTab: string;
  iconClass: string;
  label: string;
  onClick: (tab: string) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tabName, activeTab, iconClass, label, onClick }) => {
  const isActive = activeTab === tabName;
  return (
    <motion.button
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(tabName)}
      className={`relative flex items-center w-full text-left py-3 px-4 rounded-lg mb-2 font-medium transition-all duration-300 ease-in-out group // Added group for hover effects on child elements
        ${isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-transparent hover:bg-blue-50 text-gray-700 hover:text-blue-700'
        }`}
      aria-current={isActive ? 'page' : undefined} // Accessibility: indicates current tab
      role="tab" // Accessibility: defines role for tab navigation
      aria-selected={isActive} // Accessibility: indicates selection state
    >
      <i className={`${iconClass} mr-3 text-lg ${isActive ? 'text-white' : 'text-blue-500 group-hover:text-blue-700'}`}></i>
      {label}
      {isActive && (
        <motion.span
          layoutId="activeTabIndicator"
          className="absolute left-0 top-0 h-full w-1 bg-yellow-400 rounded-l-lg"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
};


// --- SettingsPage Component ---
const SettingsPage: React.FC = () => {
  const { userInfo, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // More descriptive name

  // Simulate a slight delay for a smoother initial page load animation,
  // in addition to waiting for authentication info.
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadComplete(true);
    }, 300); // Small delay to allow the overall page animation to kick in

    return () => clearTimeout(timer);
  }, []);

  // Framer Motion variants for page entry
  const pageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }, // More expressive ease
  };

  // Framer Motion variants for content section transitions
  const contentVariants: Variants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }, // Named eases are clearer
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  // --- Conditional Rendering for Loading and Auth States ---

  // Show a full-screen loading spinner while authentication info is being fetched
  // OR until the artificial initial load delay completes (for smoother UI transition).
  if (authLoading || !initialLoadComplete) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-xl text-gray-600 font-semibold">Loading settings... ⚙️</p>
      </div>
    );
  }

  // If userInfo is still null/undefined after loading, show authentication required message
  // This means authLoading is false, but no user was found/logged in.
  if (!userInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', damping: 10, stiffness: 100 }}
          className="text-center p-8 bg-white rounded-xl shadow-xl border-2 border-yellow-300 transform hover:scale-105 transition-transform duration-300"
        >
          <i className="fas fa-exclamation-circle text-yellow-600 text-5xl mb-4 animate-bounce-slow"></i>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Authentication Required!</h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            It looks like you're not logged in or your session has expired.
            Please log in to access and manage your settings.
          </p>
          {/* Optionally, add a login button or redirect prompt */}
          {/* <button
            onClick={() => window.location.href = '/login'} // Example: redirect to login page
            className="mt-5 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 font-semibold text-lg"
          >
            Go to Login
          </button> */}
        </motion.div>
      </div>
    );
  }

  // Render the actual settings content once userInfo is available and initialLoadComplete is true
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="settings-page p-4 sm:p-6 md:p-8 bg-gray-100 min-h-screen font-sans text-gray-800 antialiased"
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4 sm:mb-6 flex items-center">
        <i className="fas fa-cog mr-3 text-purple-600"></i> User Settings
      </h2>
      <p className="text-gray-700 mb-8 text-base sm:text-lg max-w-3xl leading-relaxed">
        Manage your profile information, change your password, and customize your preferences for a personalized experience.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar for Navigation Tabs */}
        <div className="md:w-1/4 bg-white rounded-xl shadow-lg p-4 h-fit top-6 self-start // sticky for long content
          border border-gray-200">
          <nav role="tablist" aria-label="Settings categories"> {/* Accessibility: ARIA roles for tablist */}
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
            {/* Future TabButtons can be added here */}
            {/* <TabButton
              tabName="notifications"
              activeTab={activeTab}
              iconClass="fas fa-bell"
              label="Notification Preferences"
              onClick={setActiveTab}
            />
            <TabButton
              tabName="privacy"
              activeTab={activeTab}
              iconClass="fas fa-shield-alt"
              label="Privacy Settings"
              onClick={setActiveTab}
            /> */}
          </nav>
        </div>

        {/* Content Area for Active Tab */}
        <div className="md:w-3/4 bg-white rounded-xl shadow-lg p-6 sm:p-8 min-h-[500px] border border-gray-200">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile-settings"
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                tabIndex={0} // Makes the content focusable for screen readers when it appears
                aria-label="Profile Settings Section"
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
                tabIndex={0} // Makes the content focusable for screen readers
                aria-label="Password and Security Settings Section"
              >
                <PasswordSettings />
              </motion.div>
            )}
            {/* Add more content sections for other tabs here */}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;