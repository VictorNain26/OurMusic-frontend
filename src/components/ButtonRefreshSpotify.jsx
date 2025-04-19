import React, { useState, useRef } from 'react';
import { useSSE } from '../hooks/useSSE';
import Input from './ui/Input';
import Button from './ui/Button';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../utils/config';

const BASE_URL = `${API_BASE_URL}/api/live/spotify`;

const getSSEUrl = (type, id = '') => {
  switch (type) {
    case 'scrape':
      return `${BASE_URL}/scrape`;
    case 'syncAll':
      return `${BASE_URL}/sync`;
    case 'syncOne':
      return `${BASE_URL}/sync/${id}`;
    default:
      return BASE_URL;
  }
};

const ButtonRefreshSpotify = () => {
  const [inputId, setInputId] = useState('');
  const lastClickRef = useRef(0);
  const { messages, status, isBusy, startSSE } = useSSE();

  const handleAction = (type) => {
    const now = Date.now();
    if (now - lastClickRef.current < 300) return; // 🧯 anti double clic (300ms)
    lastClickRef.current = now;

    if (isBusy) {
      toast.error('⏳ Une action est déjà en cours.');
      return;
    }

    if (type === 'syncOne') {
      const id = inputId.trim();
      if (!id) {
        toast.error('Veuillez entrer un ID de playlist');
        return;
      }
      startSSE(getSSEUrl(type, id), { isSingle: true });
      return;
    }

    if (type === 'syncAll') {
      startSSE(getSSEUrl(type));
    }

    if (type === 'scrape') {
      startSSE(getSSEUrl(type), { isScraping: true });
    }
  };

  return (
    <div className="text-center max-w-lg mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des playlists Spotify</h1>

      <div className="mb-4">
        <Input
          placeholder="Entrer l'ID de la playlist"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          disabled={isBusy}
        />
      </div>

      <Button
        onClick={() => handleAction('syncOne')}
        disabled={isBusy || !inputId.trim()}
        fullWidth
        variant="primary"
        size="md"
        className="mb-3"
      >
        {status.single ? 'Synchronisation en cours…' : 'Synchroniser une playlist'}
      </Button>

      <Button
        onClick={() => handleAction('syncAll')}
        disabled={isBusy}
        fullWidth
        variant="secondary"
        size="md"
        className="mb-3"
      >
        {status.sync ? 'Synchronisation globale…' : 'Synchroniser toutes les playlists'}
      </Button>

      <Button
        onClick={() => handleAction('scrape')}
        disabled={isBusy}
        fullWidth
        variant="success"
        size="md"
        className="mb-3"
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
