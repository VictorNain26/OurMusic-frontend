import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

const interestingPhrases = [
  "Début de la synchronisation",
  "Synchronisation réussie pour",
  "Traitement de la playlist",
  "Toutes les playlists ont été synchronisées"
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

const ButtonRefreshSpotify = ({ playlistId }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const eventSourceRef = useRef(null);

  // Détermine l'URL de l'endpoint SSE selon la présence d'un playlistId
  const getSseUrl = () => {
    const baseUrl = 'https://ourmusic-api.ovh/api/live/spotify/sync';
    return playlistId ? `${baseUrl}/${playlistId}` : baseUrl;
  };

  const handleRefresh = () => {
    setLoading(true);
    setMessage('');

    const sseUrl = getSseUrl();

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
        setMessage(displayedMessage);
      }
    };

    eventSource.onerror = (err) => {
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log("Connexion SSE fermée normalement.");
      } else {
        console.error("Erreur SSE réelle :", err);
      }
      setLoading(false);
      eventSource.close();
    };

    eventSource.onclose = () => {
      console.log("Connexion SSE fermée.");
      setLoading(false);
    };
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
    <div className="text-center" style={{ marginTop: '2rem' }}>
      <h1 className="text-xl mb-3">Rafraîchir les playlists Spotify</h1>
      <button
        className="bg-slate-800 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleRefresh}
        disabled={loading}
        style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
      >
        {loading ? 'Synchronisation en cours...' : 'Rafraîchir les playlists'}
      </button>
      <div className="mt-3 text-lg">
        {message && <span>{message}</span>}
      </div>
    </div>
  );
};

// Validation des props avec PropTypes
ButtonRefreshSpotify.propTypes = {
  playlistId: PropTypes.string, // playlistId est optionnel, mais doit être une string s'il est présent
};

export default ButtonRefreshSpotify;
