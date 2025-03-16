import React from 'react';
import ButtonRefreshSpotify from '../components/ButtonRefreshSpotify';

const AdminDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">🎛️ Dashboard Administrateur</h1>

      <section className="bg-white rounded-xl shadow-xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">📦 Gestion des playlists Spotify</h2>
          <ButtonRefreshSpotify />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
