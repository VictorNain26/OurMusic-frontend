import React, { useState } from 'react';
import AzuracastPlayer from '../components/AzuracastPlayer';
import { useAuth } from '../hooks/useAuth';
import { usePlayerStore } from '../lib/playerService';
import { motion } from 'framer-motion';
import SidePanel from '../components/SidePanel';
import PageWrapper from '../layout/PageWrapper';

const HomePage = () => {
  const { isLoading } = useAuth();
  const [isPanelOpen, setPanelOpen] = useState(false);
  const nowPlaying = usePlayerStore((s) => s.nowPlaying);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageWrapper className="bg-white">
      <div className="w-full flex justify-end mt-2 mb-4">
        <button
          onClick={() => setPanelOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
        >
          🎵 Voir les morceaux aimés
        </button>
      </div>

      <AzuracastPlayer />

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setPanelOpen(false)}
        nowPlaying={nowPlaying}
      />
    </PageWrapper>
  );
};

export default HomePage;
