import { useState, useEffect, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getAccessToken } from '../utils/api';  // Pour récupérer le token stocké localement

const interestingPhrases = [
  "Début de la synchronisation",
  "Synchronisation réussie pour",
  "Traitement de la playlist",
  "Toutes les playlists ont été synchronisées",
  "Début du scrap",
  "Scrap terminé",
];

function isInteresting(message) {
  if (
    message.includes("Skipping") ||
    message.includes("Processing query") ||
    message.includes("Nothing to delete")
  ) {
    return false;
  }
  return interestingPhrases.some(phrase => message.includes(phrase));
}

const ButtonRefreshSpotify = () => {
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false); // synchro playlist unique
  const [messages, setMessages] = useState([]);
  const [inputPlaylistId, setInputPlaylistId] = useState('');
  const eventSourceAbortController = useRef(null);

  const getSseUrl = (isScraping = false, isSingleSync = false, playlistId = '') => {
    const baseUrl = isScraping
      ? 'https://ourmusic-api.ovh/api/live/spotify/scrape'
      : 'https://ourmusic-api.ovh/api/live/spotify/sync';

    if (isSingleSync && playlistId) {
      return `${baseUrl}/${playlistId}`;
    }
    return baseUrl;
  };

  function closeSSE() {
    // fetch-event-source s'abandonne via un AbortController
    if (eventSourceAbortController.current) {
      eventSourceAbortController.current.abort();
    }
  }

  const handleSseConnection = (isScraping = false, isSingleSync = false, playlistId = '') => {
    if (isScraping) {
      setScraping(true);
    } else if (isSingleSync) {
      setSingleSyncLoading(true);
    } else {
      setLoading(true);
    }
    setMessages([]);

    const sseUrl = getSseUrl(isScraping, isSingleSync, playlistId);

    // Fermer l'ancienne connexion SSE si existante
    closeSSE();

    // Créer un AbortController pour stopper le flux si besoin
    const controller = new AbortController();
    eventSourceAbortController.current = controller;

    // Récupérer notre accessToken
    const token = getAccessToken();

    // Lancement du flux SSE via fetchEventSource
    fetchEventSource(sseUrl, {
      signal: controller.signal,            // pour pouvoir stopper
      headers: {
        // On ajoute Authorization si on a un token
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Indique qu'on veut envoyer aussi les cookies
      fetch: (url, init) => {
        return fetch(url, {
          ...init,
          credentials: 'include',
        });
      },
      onopen(res) {
        if (res.ok && res.status === 200) {
          console.log("Connexion SSE établie (fetch-event-source).");
        } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          // Erreur client
          throw new Error(`Erreur client SSE: ${res.statusText}`);
        }
      },
      onmessage(evt) {
        if (!evt.data || evt.data.trim() === '.') return;
        let data;
        try {
          data = JSON.parse(evt.data);
        } catch {
          data = { message: `Erreur de parsing JSON: ${evt.data}` };
        }
        const displayedMessage =
          data.pub && data.pub.message ? data.pub.message : (data.message || '');

        if (isInteresting(displayedMessage)) {
          setMessages((prev) => [...prev, displayedMessage]);
        }
      },
      onerror(err) {
        console.error("Erreur SSE réelle :", err);
        setLoading(false);
        setScraping(false);
        setSingleSyncLoading(false);
        controller.abort();
      },
      onclose() {
        console.log("Flux SSE fermé.");
        setLoading(false);
        setScraping(false);
        setSingleSyncLoading(false);
      },
    });
  };

  const handleGlobalSync = () => handleSseConnection(false);
  const handleScrape = () => handleSseConnection(true);
  const handleSingleSync = () => {
    if (inputPlaylistId.trim()) {
      handleSseConnection(false, true, inputPlaylistId.trim());
    } else {
      alert('Veuillez entrer un ID de playlist valide.');
    }
  };

  // Nettoyage : fermer SSE quand le composant se démonte
  useEffect(() => {
    return () => {
      closeSSE();
    };
  }, []);

  return (
    <div className="text-center max-w-lg mx-auto" style={{ marginTop: '2rem' }}>
      <h1 className="text-2xl font-bold mb-6">Gestion des playlists Spotify</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Entrer l'ID de la playlist"
          value={inputPlaylistId}
          onChange={(e) => setInputPlaylistId(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
          style={{ maxWidth: '400px', margin: '0 auto' }}
        />
      </div>

      <button
        className={`bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded mb-4 w-full ${
          singleSyncLoading || loading || scraping ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleSingleSync}
        disabled={singleSyncLoading || loading || scraping}
      >
        {singleSyncLoading ? 'Synchronisation de la playlist...' : 'Synchroniser une playlist'}
      </button>

      <button
        className={`bg-slate-800 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded mb-4 w-full ${
          loading || scraping || singleSyncLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleGlobalSync}
        disabled={loading || scraping || singleSyncLoading}
      >
        {loading ? 'Synchronisation globale en cours...' : 'Synchronisation globale'}
      </button>

      <button
        className={`bg-slate-800 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded mb-4 w-full ${
          scraping || loading || singleSyncLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleScrape}
        disabled={scraping || loading || singleSyncLoading}
      >
        {scraping ? 'Scraping en cours...' : 'Scraper les playlists'}
      </button>

      <div className="mt-6 bg-gray-100 p-4 rounded shadow-sm text-left">
        <h2 className="text-lg font-semibold mb-3">Progression :</h2>
        {messages.length === 0 ? (
          <p className="text-gray-500">Aucun message pour le moment.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {messages.map((msg, index) => (
              <li key={index} className="text-gray-700">
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ButtonRefreshSpotify;
