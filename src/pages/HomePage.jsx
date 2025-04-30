import React, { useState } from 'react';
import AzuracastPlayer from '../components/AzuracastPlayer';
import { useAuth } from '../hooks/useAuth';
import { usePlayerStore } from '../lib/playerService';
import SidePanel from '../components/SidePanel';
import PageWrapper from '../layout/PageWrapper';

const HomePage = () => {
  const { isLoading } = useAuth();
  const [isPanelOpen, setPanelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageWrapper className="flex flex-col items-center justify-center h-full px-4 bg-white relative overflow-hidden">
      {/* Bouton SidePanel fixe en haut à droite */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setPanelOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Détails d'écoute
        </button>
      </div>

      {/* Player centré verticalement */}
      <div className="w-full max-w-4xl flex-grow flex items-center justify-center">
        <AzuracastPlayer />
      </div>

      {/* Side Panel avec dernier morceau + likés */}
      <SidePanel isOpen={isPanelOpen} onClose={() => setPanelOpen(false)} />
    </PageWrapper>
  );
};

export default HomePage;
