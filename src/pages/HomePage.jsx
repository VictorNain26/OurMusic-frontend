import React, { useEffect } from 'react';
import AzuracastPlayer from '../components/AzuracastPlayer';
import LikedTracksList from '../components/LikedTracksList';
import { useAuthStore } from '../store/authStore';
import { AnimatePresence, motion } from 'framer-motion';
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
      <AnimatePresence mode="wait">
        {user && (
          <motion.div
            key="liked-tracks-wrapper"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            <LikedTracksList />
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default HomePage;
