// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import AzuracastPlayer from '../components/AzuracastPlayer';
import LikedTracksList from '../components/LikedTracksList';
import { useAuthStore } from '../store/authStore';
import PageWrapper from '../layout/PageWrapper';

const HomePage = () => {
  const { user, authReady, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!authReady) fetchUser();
  }, [authReady, fetchUser]);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageWrapper className="bg-white">
      <AzuracastPlayer />
      {user && <LikedTracksList />}
    </PageWrapper>
  );
};

export default HomePage;
