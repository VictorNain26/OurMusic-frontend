import React, { useState } from 'react';
import { useSSE } from '../hooks/useSSE';
import Input from './ui/Input';
import Button from './ui/Button';
import { toast } from 'react-hot-toast';

const BASE_URL = 'https://ourmusic-api.ovh/api/live/spotify';

const getSSEUrl = (type, id = '') => {
  switch (type) {
    case 'scrape': return `${BASE_URL}/scrape`;
    case 'syncAll': return `${BASE_URL}/sync`;
    case 'syncOne': return `${BASE_URL}/sync/${id}`;
    default: return BASE_URL;
  }
};

const ButtonRefreshSpotify = () => {
  const [inputPlaylistId, setInputPlaylistId] = useState('');
  const { messages, status, isBusy, startSSE } = useSSE();

  const handleSingleSync = () => {
    const id = inputPlaylistId.trim();
    if (!id) return toast.error('Veuillez entrer un ID de playlist');
    startSSE(getSSEUrl('syncOne', id), { isSingle: true });
  };

  const handleGlobalSync = () => startSSE(getSSEUrl('syncAll'));
  const handleScrape = () => startSSE(getSSEUrl('scrape'), { isScraping: true });

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

      <Button
        onClick={handleSingleSync}
        disabled={isBusy}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white mb-3"
      >
        {status.single ? 'Synchronisation en cours…' : 'Synchroniser une playlist'}
      </Button>

      <Button
        onClick={handleGlobalSync}
        disabled={isBusy}
        className="w-full bg-slate-800 hover:bg-slate-600 text-white mb-3"
      >
        {status.sync ? 'Synchronisation globale…' : 'Synchroniser toutes les playlists'}
      </Button>

      <Button
        onClick={handleScrape}
        disabled={isBusy}
        className="w-full bg-slate-800 hover:bg-slate-600 text-white mb-3"
      >
        {status.scrape ? 'Scraping en cours…' : 'Scraper les playlists'}
      </Button>

      <div className="mt-6 bg-gray-100 p-4 rounded shadow-sm text-left max-h-[300px] overflow-y-auto">
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
