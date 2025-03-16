import React, { useEffect } from 'react';
import AzuracastPlayer from '../components/AzuracastPlayer';
import LikedTracksList from '../components/LikedTracksList';
import { useAuthStore } from '../store/authStore';
import { useLikedTracks } from '../hooks/useLikedTracks';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  const { user, authReady, fetchUser } = useAuthStore();
  const { isLoading } = useLikedTracks();

  useEffect(() => {
    if (!authReady) fetchUser();
  }, [authReady, fetchUser]);

  const isReady = authReady && (!user || !isLoading);

  if (!authReady || (user && isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="homepage-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="min-h-screen bg-white"
      >
        <AzuracastPlayer />
        {user && <LikedTracksList />}
      </motion.div>
    </AnimatePresence>
  );
};

export default HomePage;
