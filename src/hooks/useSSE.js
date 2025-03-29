import { useRef, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getAccessToken } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../utils/config';

const BASE_URL = `${API_BASE_URL}/api/live/spotify`;

const DEFAULT_MESSAGES = [
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
  DEFAULT_MESSAGES.some((phrase) => msg.includes(phrase));

export const useSSE = () => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({ sync: false, scrape: false, single: false });
  const controllerRef = useRef(null);
  const user = useAuthStore.getState().user;

  const resetStatus = () =>
    setStatus({ sync: false, scrape: false, single: false });

  const stopSSE = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    resetStatus();
  };

  const startSSE = (url, { isScraping = false, isSingle = false, filter = defaultFilter } = {}) => {
    stopSSE();
    setMessages([]);

    const isSync = !isScraping && !isSingle;
    setStatus({ sync: isSync, scrape: isScraping, single: isSingle });

    if (!user) {
      toast.error('Vous devez être connecté pour lancer cette action.');
      resetStatus();
      return;
    }

    const token = getAccessToken();
    const controller = new AbortController();
    controllerRef.current = controller;

    fetchEventSource(url, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },

      onopen(res) {
        if (!res.ok) {
          toast.error(`Erreur SSE (${res.status})`);
          stopSSE();
          throw new Error(`SSE non ouvert : ${res.status}`);
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

        if (msg && filter(msg)) {
          setMessages((prev) => [...prev, msg]);
        }

        if (err) {
          toast.error(err);
          setMessages((prev) => [...prev, `❌ ${err}`]);
        }
      },

      onerror(err) {
        console.error('[SSE Error]', err);
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
    status,
    isBusy: status.sync || status.scrape || status.single,
    startSSE,
    stopSSE,
  };
};
