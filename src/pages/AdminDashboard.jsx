import React from 'react';
import ButtonRefreshSpotify from '../components/ButtonRefreshSpotify';

const AdminDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">🎛️ Dashboard Admin</h1>

      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">📦 Gestion des Playlists Spotify</h2>
        <ButtonRefreshSpotify />
      </div>
    </div>
  );
};

export default AdminDashboard;
