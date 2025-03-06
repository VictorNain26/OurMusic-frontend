import { useState, useEffect, useRef } from 'react';

const interestingPhrases = [
  "Début de la synchronisation",
  "Synchronisation réussie pour",
  "Traitement de la playlist",
  "Toutes les playlists ont été synchronisées",
  "Début du scrap",
  "Scrap terminé",
];

function isInteresting(message) {
  // Filtrer certains messages non pertinents
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
  const [singleSyncLoading, setSingleSyncLoading] = useState(false); // Pour la synchronisation d'une seule playlist
  const [messages, setMessages] = useState([]); // Pour stocker plusieurs messages
  const [inputPlaylistId, setInputPlaylistId] = useState(''); // Pour stocker l'ID de la playlist
  const eventSourceRef = useRef(null);

  // Détermine l'URL de l'endpoint SSE selon la présence d'un playlistId
  const getSseUrl = (isScraping = false, isSingleSync = false, playlistId = '') => {
    const baseUrl = isScraping
      ? 'https://ourmusic-api.ovh/api/live/spotify/scrape'
      : 'https://ourmusic-api.ovh/api/live/spotify/sync';

    if (isSingleSync && playlistId) {
      return `${baseUrl}/${playlistId}`;
    }

    return baseUrl;
  };

  const handleSseConnection = (isScraping = false, isSingleSync = false, playlistId = '') => {
    if (isScraping) {
      setScraping(true);
    } else if (isSingleSync) {
      setSingleSyncLoading(true);
    } else {
      setLoading(true);
    }
    setMessages([]); // Réinitialiser les messages au début de chaque synchronisation

    const sseUrl = getSseUrl(isScraping, isSingleSync, playlistId);

    // Si une connexion SSE existe déjà, la fermer
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("Connexion SSE établie.");
    };

    eventSource.onmessage = (e) => {
      // Ignore les keep-alive ou messages de remplissage
      if (e.data.trim() === '.') return;

      let data;
      try {
        data = JSON.parse(e.data);
      } catch {
        data = { message: `Erreur de parsing JSON: ${e.data}` };
      }

      // On extrait le message à afficher
      const displayedMessage =
        data.pub && data.pub.message ? data.pub.message : (data.message || '');

      if (data.pub && data.pub.message && !data.pub.message.toLowerCase().includes("timer")) {
        console.log("Message SSE reçu (pub message):", data.pub.message);
      }

      // Afficher uniquement les messages pertinents
      if (isInteresting(displayedMessage)) {
        setMessages((prevMessages) => [...prevMessages, displayedMessage]);
      }
    };

    eventSource.onerror = (err) => {
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log("Connexion SSE fermée normalement.");
      } else {
        console.error("Erreur SSE réelle :", err);
      }
      setLoading(false);
      setScraping(false);
      setSingleSyncLoading(false);
      eventSource.close();
    };

    eventSource.onclose = () => {
      console.log("Connexion SSE fermée.");
      setLoading(false);
      setScraping(false);
      setSingleSyncLoading(false);
    };
  };

  const handleGlobalSync = () => handleSseConnection(false); // Synchronisation globale
  const handleScrape = () => handleSseConnection(true); // Scrap
  const handleSingleSync = () => {
    if (inputPlaylistId.trim()) {
      handleSseConnection(false, true, inputPlaylistId.trim()); // Synchronisation d'une seule playlist
    } else {
      alert('Veuillez entrer un ID de playlist valide.');
    }
  };

  // Nettoyage de l'EventSource lors du démontage du composant
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="text-center max-w-lg mx-auto" style={{ marginTop: '2rem' }}>
      <h1 className="text-2xl font-bold mb-6">Gestion des playlists Spotify</h1>

      {/* Champ pour entrer l'ID de la playlist */}
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

      {/* Bouton pour synchroniser une seule playlist */}
      <button
        className={`bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded mb-4 w-full ${
          singleSyncLoading || loading || scraping ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleSingleSync}
        disabled={singleSyncLoading || loading || scraping}
      >
        {singleSyncLoading ? 'Synchronisation de la playlist...' : 'Synchroniser une playlist'}
      </button>

      {/* Bouton pour synchroniser toutes les playlists */}
      <button
        className={`bg-slate-800 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded mb-4 w-full ${
          loading || scraping || singleSyncLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleGlobalSync}
        disabled={loading || scraping || singleSyncLoading}
      >
        {loading ? 'Synchronisation globale en cours...' : 'Synchronisation globale'}
      </button>

      {/* Bouton pour le scrap */}
      <button
        className={`bg-slate-800 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded mb-4 w-full ${
          scraping || loading || singleSyncLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleScrape}
        disabled={scraping || loading || singleSyncLoading}
      >
        {scraping ? 'Scraping en cours...' : 'Scraper les playlists'}
      </button>

      {/* Section des messages de progression */}
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
