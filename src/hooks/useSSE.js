// src/hooks/useSSE.js
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
  const isRunning = useRef(false);
  const messagesRef = useRef([]); // ✅ pour accès stable à la fin

  const stopSSE = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    isRunning.current = false;
    setStatus({ sync: false, scrape: false, single: false });
    messagesRef.current = [];
  };

  useEffect(() => stopSSE, []);

  const startSSE = (
    url,
    { isScraping = false, isSingle = false, filter = defaultFilter } = {}
  ) => {
    stopSSE(); // 🛑 Nettoyage à froid

    isRunning.current = true;
    setMessages([]);
    messagesRef.current = [];
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
      headers: { 'Content-Type': 'application/json' },

      async onopen(res) {
        if (!res.ok) {
          stopSSE();
          throw new Error(`Erreur ouverture SSE : ${res.status}`);
        }
      },

      onmessage(event) {
        if (!event.data || event.data.trim() === '.') return;

        try {
          const json = JSON.parse(event.data);
          const msg = json?.pub?.message || json?.message || '';
          const err = json?.pub?.error || json?.error;

          if (err) {
            console.error('[SSE Error]', err);
            toast.error(`❌ ${err}`);
            stopSSE();
            return;
          }

          if (msg && filter(msg)) {
            messagesRef.current.push(msg);
            setMessages((prev) => [...prev, msg]);
          }
        } catch (err) {
          console.error('[SSE Parsing Error]', event.data, err);
          setMessages((prev) => [...prev, `⚠️ Erreur parsing : ${event.data}`]);
          stopSSE();
        }
      },

      onerror(err) {
        console.error('[SSE onerror]', err);
        toast.error('⚠️ Erreur réseau ou serveur SSE');
        stopSSE();
      },

      onclose() {
        if (messagesRef.current.length > 0) {
          toast.success('✅ Synchronisation terminée');
        } else {
          toast.error('❌ Synchronisation interrompue ou échouée');
        }
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
