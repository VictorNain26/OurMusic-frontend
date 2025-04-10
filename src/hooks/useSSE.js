import { useRef, useState, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { toast } from 'react-hot-toast';

const DEFAULT_MESSAGES = [
  'Début de la synchronisation',
  'Synchronisation réussie',
  'Toutes les playlists ont été synchronisées',
  'Début du scrap',
  'Scrap terminé',
  'Traitement de la playlist',
  'Playlist créée',
  'Playlist existante',
  'Morceaux ajoutés',
];

const defaultFilter = (msg = '') =>
  DEFAULT_MESSAGES.some((phrase) => msg.includes(phrase));

export const useSSE = () => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({ sync: false, scrape: false, single: false });
  const controllerRef = useRef(null);

  const stopSSE = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setStatus({ sync: false, scrape: false, single: false });
  };

  useEffect(() => stopSSE, []);

  const startSSE = (
    url,
    { isScraping = false, isSingle = false, filter = defaultFilter } = {}
  ) => {
    if (controllerRef.current) {
      toast.error('Une action est déjà en cours.');
      return;
    }

    setMessages([]);
    setStatus({
      sync: !isScraping && !isSingle,
      scrape: isScraping,
      single: isSingle,
    });

    const controller = new AbortController();
    controllerRef.current = controller;

    fetchEventSource(url, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },

      async onopen(res) {
        if (!res.ok) {
          console.error(`[SSE] Erreur ouverture : ${res.status}`);
          stopSSE();
          throw new Error(`Erreur ouverture SSE : ${res.status}`);
        }
      },

      onmessage(event) {
        if (!event.data || event.data.trim() === '.') return;

        let parsed;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          parsed = { message: `⚠️ Erreur de parsing : ${event.data}` };
        }

        const msg = parsed?.pub?.message || parsed?.message || '';
        const err = parsed?.pub?.error || parsed?.error;

        if (msg && filter(msg)) {
          setMessages((prev) => [...prev, msg]);
        }

        if (err) {
          console.error('[SSE Error]', err);
        }
      },

      onerror(err) {
        console.error('[SSE onerror]', err);
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
