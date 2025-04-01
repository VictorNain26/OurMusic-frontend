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

  // Fonction de nettoyage pour stopper la connexion SSE active
  const stopSSE = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setStatus({ sync: false, scrape: false, single: false });
  };

  // Nettoyer la connexion SSE lors du démontage du composant
  useEffect(() => {
    return () => {
      stopSSE();
    };
  }, []);

  const startSSE = (url, { isScraping = false, isSingle = false, filter = defaultFilter } = {}) => {
    // Si une connexion est déjà active, ne rien faire
    if (controllerRef.current) {
      return;
    }

    // Réinitialiser les messages et définir le statut
    setMessages([]);
    const isSync = !isScraping && !isSingle;
    setStatus({ sync: isSync, scrape: isScraping, single: isSingle });

    // Créer un nouveau contrôleur pour la connexion SSE
    const controller = new AbortController();
    controllerRef.current = controller;

    fetchEventSource(url, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
