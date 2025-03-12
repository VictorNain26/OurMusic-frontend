import { useRef, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getAccessToken } from '../utils/api';

const defaultFilter = (message) =>
  [
    "Début de la synchronisation",
    "Synchronisation réussie",
    "Toutes les playlists ont été synchronisées",
    "Début du scrap",
    "Scrap terminé",
    "Traitement de la playlist"
  ].some((phrase) => message.includes(phrase));

export const useSSE = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false);
  const controllerRef = useRef(null);

  const closeSSE = () => controllerRef.current?.abort();

  const handleSSE = (url, { isScraping = false, isSingle = false, filter = defaultFilter }) => {
    setMessages([]);
    setLoading(!isScraping && !isSingle);
    setScraping(isScraping);
    setSingleSyncLoading(isSingle);

    closeSSE();
    const controller = new AbortController();
    controllerRef.current = controller;

    const token = getAccessToken();
    fetchEventSource(url, {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      fetch: (u, init) => fetch(u, { ...init, credentials: 'include' }),

      onopen(res) {
        if (!res.ok) throw new Error(`SSE failed (${res.status})`);
      },

      onmessage(evt) {
        if (!evt.data || evt.data.trim() === '.') return;
        let data;
        try {
          data = JSON.parse(evt.data);
        } catch {
          data = { message: `Erreur de parsing : ${evt.data}` };
        }
        const msg = data.pub?.message || data.message;
        if (filter(msg)) setMessages((prev) => [...prev, msg]);
      },

      onerror(err) {
        console.error("Erreur SSE:", err);
        closeSSE();
        setLoading(false);
        setScraping(false);
        setSingleSyncLoading(false);
      },

      onclose() {
        setLoading(false);
        setScraping(false);
        setSingleSyncLoading(false);
      },
    });
  };

  return {
    messages,
    loading,
    scraping,
    singleSyncLoading,
    startSSE: handleSSE,
    stopSSE: closeSSE,
  };
};