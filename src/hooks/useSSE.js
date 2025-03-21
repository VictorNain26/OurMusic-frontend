import { useRef, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getAccessToken } from '../utils/api';
import { toast } from 'react-hot-toast';

const DEFAULT_FILTER_MESSAGES = [
  "Début de la synchronisation",
  "Synchronisation réussie",
  "Toutes les playlists ont été synchronisées",
  "Début du scrap",
  "Scrap terminé",
  "Traitement de la playlist",
  "Playlist créée",
  "Playlist existante",
  "Morceaux ajoutés",
];

const defaultFilter = (msg = '') =>
  DEFAULT_FILTER_MESSAGES.some((phrase) => msg.includes(phrase));

export const useSSE = () => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({ sync: false, scrape: false, single: false });
  const controllerRef = useRef(null);

  const stopSSE = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus({ sync: false, scrape: false, single: false });
  };

  const startSSE = (url, { isScraping = false, isSingle = false, filter = defaultFilter } = {}) => {
    stopSSE(); // Cleanup
    setMessages([]);
    setStatus({
      sync: !isScraping && !isSingle,
      scrape: isScraping,
      single: isSingle,
    });

    const controller = new AbortController();
    controllerRef.current = controller;
    const token = getAccessToken();

    fetchEventSource(url, {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      fetch: (u, init) => fetch(u, { ...init, credentials: 'include' }),

      onopen(res) {
        if (!res.ok) {
          toast.error(`Connexion SSE échouée (${res.status})`);
          stopSSE();
          throw new Error('SSE non ouvert');
        }
      },

      onmessage(evt) {
        if (!evt.data || evt.data.trim() === '.') return;

        let parsed;
        try {
          parsed = JSON.parse(evt.data);
        } catch {
          parsed = { message: `⚠️ Erreur parsing : ${evt.data}` };
        }

        const msg = parsed?.pub?.message || parsed?.message || '';
        const err = parsed?.pub?.error || parsed?.error;

        if (msg && filter(msg)) setMessages((prev) => [...prev, msg]);
        if (err) {
          toast.error(err);
          setMessages((prev) => [...prev, `❌ ${err}`]);
        }
      },

      onerror(err) {
        toast.error('Erreur SSE. Vérifiez votre connexion ou vos droits.');
        console.error('[SSE Fatal Error]', err);
        stopSSE();
      },

      onclose() {
        stopSSE();
      },
    });
  };

  return {
    messages,
    status,
    isBusy: status.sync || status.scrape || status.single,
    startSSE,
    stopSSE,
  };
};
