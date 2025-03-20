import React from 'react';
import ButtonRefreshSpotify from '../components/ButtonRefreshSpotify';
import PageWrapper from '../layout/PageWrapper';

const AdminDashboard = () => {
  return (
    <PageWrapper className="bg-white">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">🎛️ Dashboard Administrateur</h1>

        <div className="bg-white rounded-xl shadow-xl p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">📦 Gestion des playlists Spotify</h2>
            <ButtonRefreshSpotify />
          </section>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AdminDashboard;
