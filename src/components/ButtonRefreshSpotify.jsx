import React, { useState } from 'react';
import { useSSE } from '../hooks/useSSE';
import Input from './ui/Input';
import Button from './ui/Button';

const ButtonRefreshSpotify = () => {
  const [inputPlaylistId, setInputPlaylistId] = useState('');
  const {
    messages,
    loading,
    scraping,
    singleSyncLoading,
    startSSE,
    stopSSE
  } = useSSE();

  const getUrl = (type, id = '') => {
    const base = 'https://ourmusic-api.ovh/api/live/spotify';
    return type === 'scrape' ? `${base}/scrape` : id ? `${base}/sync/${id}` : `${base}/sync`;
  };

  const handleGlobalSync = () => startSSE(getUrl('sync'));
  const handleScrape = () => startSSE(getUrl('scrape'), { isScraping: true });
  const handleSingleSync = () => {
    if (!inputPlaylistId.trim()) return alert('Entrer un ID valide');
    startSSE(getUrl('sync', inputPlaylistId), { isSingle: true });
  };

  return (
    <div className="text-center max-w-lg mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des playlists Spotify</h1>
      <div className="mb-4">
        <Input
          placeholder="Entrer l'ID de la playlist"
          value={inputPlaylistId}
          onChange={(e) => setInputPlaylistId(e.target.value)}
        />
      </div>

      <Button onClick={handleSingleSync} disabled={loading || scraping || singleSyncLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white mb-3">
        {singleSyncLoading ? 'Synchronisation de la playlist...' : 'Synchroniser une playlist'}
      </Button>
      <Button onClick={handleGlobalSync} disabled={loading || scraping || singleSyncLoading} className="w-full bg-slate-800 hover:bg-slate-600 text-white mb-3">
        {loading ? 'Synchronisation globale en cours...' : 'Synchronisation globale'}
      </Button>
      <Button onClick={handleScrape} disabled={scraping || loading || singleSyncLoading} className="w-full bg-slate-800 hover:bg-slate-600 text-white mb-3">
        {scraping ? 'Scraping en cours...' : 'Scraper les playlists'}
      </Button>

      <div className="mt-6 bg-gray-100 p-4 rounded shadow-sm text-left">
        <h2 className="text-lg font-semibold mb-3">Progression :</h2>
        {messages.length === 0 ? (
          <p className="text-gray-500">Aucun message pour le moment.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {messages.map((msg, i) => (
              <li key={i} className="text-gray-700 break-words">{msg}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ButtonRefreshSpotify;