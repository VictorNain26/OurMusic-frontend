import React, { useEffect, useState } from 'react';
import Button from './ui/Button';
import { usePlayerStore } from '../lib/playerService'; // on utilise déjà ton store pour récupérer nowPlaying
import { AZURACAST_URL } from '../utils/config';

const ChromecastButton = () => {
  const [castAvailable, setCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [error, setError] = useState(null);

  const currentSong = usePlayerStore((s) => s.nowPlaying?.now_playing?.song || null); // 🔥 Récupération du morceau actuel
  const station = usePlayerStore((s) => s.nowPlaying?.station || { name: 'OurMusic' });

  const RECEIVER_APP_ID = '4A922B9B';
  const STREAM_URL = 'https://ourmusic-azuracast.ovh/listen/ourmusic/radio';

  useEffect(() => {
    const initCastApi = () => {
      if (!window.cast || !window.cast.framework) return;

      const context = cast.framework.CastContext.getInstance();
      context.setOptions({
        receiverApplicationId: RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      setCastAvailable(true);

      context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
        if (event.sessionState === cast.framework.SessionState.SESSION_STARTED ||
            event.sessionState === cast.framework.SessionState.SESSION_RESUMED) {
          setIsCasting(true);
        } else {
          setIsCasting(false);
        }
      });
    };

    const loadCastScript = () => {
      if (window.cast && window.cast.framework) {
        initCastApi();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
      script.async = true;
      script.onload = initCastApi;
      script.onerror = () => {
        console.error('[Chromecast] Erreur chargement script Cast');
        setError('Échec du chargement Chromecast.');
      };
      document.body.appendChild(script);
    };

    loadCastScript();
  }, []);

  const handleCastClick = async () => {
    if (!castAvailable) {
      alert('Chromecast non disponible.');
      return;
    }

    const context = cast.framework.CastContext.getInstance();

    try {
      const session = await context.requestSession();
      console.info('[Chromecast] Session démarrée avec succès 🎯');

      const mediaInfo = new chrome.cast.media.MediaInfo(STREAM_URL, 'audio/mpeg');

      const metadata = new chrome.cast.media.MusicTrackMediaMetadata();
      metadata.title = currentSong?.title || 'OurMusic Radio';
      metadata.artist = currentSong?.artist || 'OurMusic';
      metadata.albumName = station.name || 'OurMusic Radio';
      metadata.images = [
        {
          url: currentSong?.art || `${AZURACAST_URL}/uploads/default-cover.jpg`
        }
      ];

      mediaInfo.metadata = metadata;

      const request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      await session.loadMedia(request);

    } catch (err) {
      console.error('[Chromecast] Erreur session:', err);
      setError('Erreur lors de la connexion Chromecast.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleCastClick}
        disabled={!castAvailable}
        className={`text-white ${
          isCasting
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {isCasting ? '🎶 En cours de diffusion' : '📡 Caster'}
      </Button>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default ChromecastButton;
