import { useRef, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getAccessToken } from '../utils/api';
import { toast } from 'react-hot-toast';

const defaultFilter = (message = '') =>
  [
    "Début de la synchronisation",
    "Synchronisation réussie",
    "Toutes les playlists ont été synchronisées",
    "Début du scrap",
    "Scrap terminé",
    "Traitement de la playlist",
    "Playlist créée",
    "Playlist existante",
    "Morceaux ajoutés"
  ].some((phrase) => message.includes(phrase));

export const useSSE = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false);

  const controllerRef = useRef(null);

  const stopSSE = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setLoading(false);
    setScraping(false);
    setSingleSyncLoading(false);
  };

  const startSSE = (url, { isScraping = false, isSingle = false, filter = defaultFilter } = {}) => {
    stopSSE(); // Clean any existing SSE

    const controller = new AbortController();
    controllerRef.current = controller;

    setMessages([]);
    setLoading(!isScraping && !isSingle);
    setScraping(isScraping);
    setSingleSyncLoading(isSingle);

    const token = getAccessToken();

    fetchEventSource(url, {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      fetch: (u, init) => fetch(u, { ...init, credentials: 'include' }),

      onopen(res) {
        if (!res.ok) {
          console.error('[SSE Error] Échec ouverture flux SSE:', res.status);
          toast.error(`SSE non ouvert (${res.status})`);
          stopSSE();
          throw new Error('Flux SSE échoué');
        }
      },

      onmessage(evt) {
        if (!evt.data || evt.data.trim() === '.') return;

        let parsed;
        try {
          parsed = JSON.parse(evt.data);
        } catch (err) {
          console.warn('[SSE Parse Error]', evt.data);
          parsed = { message: `Erreur de parsing : ${evt.data}` };
        }

        const msg = parsed?.pub?.message || parsed?.message || '';
        if (msg && filter(msg)) {
          setMessages((prev) => [...prev, msg]);
        }

        const errorMsg = parsed?.pub?.error || parsed?.error;
        if (errorMsg) {
          console.warn('[SSE Received Error]', errorMsg);
          toast.error(errorMsg);
          setMessages((prev) => [...prev, `❌ ${errorMsg}`]);
        }
      },

      onerror(err) {
        console.error('[SSE Fatal Error]', err);
        toast.error('Erreur SSE. Vérifiez votre connexion ou vos droits.');
        stopSSE();
      },

      onclose() {
        stopSSE();
      },
    });
  };

  return {
    messages,
    loading,
    scraping,
    singleSyncLoading,
    startSSE,
    stopSSE,
  };
};
