import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AdminGuard = ({ children }) => {
  const { user, authReady, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!authReady) {
      fetchUser();
    }
  }, [authReady, fetchUser]);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminGuard;
