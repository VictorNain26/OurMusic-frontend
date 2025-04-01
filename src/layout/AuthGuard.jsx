import React from 'react';
import { Navigate } from 'react-router-dom';
import { authClient } from '../lib/authClient';

const AuthGuard = ({ children }) => {
  const { data: session, isLoading } = authClient.useSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthGuard;
