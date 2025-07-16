// src/components/ProtectedRoute.tsx
import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // Optional: for role-based access control
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { userInfo } = useAuth();

  if (!userInfo) {
    // User is not logged in, redirect to login page.
    // The `replace` prop ensures the user can't navigate back to the protected page directly.
    return <Navigate to="/login" replace />;
  }

  // If `allowedRoles` are specified AND the logged-in user's role is NOT included in them.
  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    // User is logged in but does not have the necessary role for this route.
    console.warn(`Access Denied: User role '${userInfo.role}' is not allowed for this route. Required roles: ${allowedRoles.join(', ')}`);
    // Optionally, you might want to show an alert or a toast notification.
    alert('You do not have the required permissions to access this page. Please log in with an authorized account or contact support.');
    // Redirect to the homepage or a dedicated unauthorized access page.
    // Redirecting to "/" is generally safer for a user-friendly experience than a blank page.
    return <Navigate to="/" replace />;
  }

  // If authenticated and either no specific roles are required, or the user has an allowed role,
  // render the children components (the protected content).
  return <>{children}</>;
};

export default ProtectedRoute;