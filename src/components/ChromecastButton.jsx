import React, { useEffect, useState } from 'react';
import Button from './ui/Button';

const ChromecastButton = () => {
  const [castAvailable, setCastAvailable] = useState(false);
  const [deviceName, setDeviceName] = useState(null);
  const [error, setError] = useState(null);

  const RECEIVER_APP_ID = '4A922B9B'; // Default Media Receiver
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

      context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (event) => {
          const session = context.getCurrentSession();
          if (
            event.sessionState === cast.framework.SessionState.SESSION_STARTED ||
            event.sessionState === cast.framework.SessionState.SESSION_RESUMED
          ) {
            const device = session?.getCastDevice()?.friendlyName || 'Chromecast';
            setDeviceName(device);
          } else {
            setDeviceName(null);
          }
        }
      );
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
      if (!session) {
        console.warn('[Chromecast] Session annulée.');
        return;
      }

      const mediaInfo = new chrome.cast.media.MediaInfo(STREAM_URL, 'audio/mpeg');
      mediaInfo.streamType = chrome.cast.media.StreamType.LIVE; // ✅ Indiquer que c'est un flux radio live

      const request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      await session.loadMedia(request);

      // 🔥 Récupérer proprement le nom du device
      const device = session?.getCastDevice()?.friendlyName || 'Chromecast';
      setDeviceName(device);

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
          deviceName
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {deviceName ? `📡 Cast sur "${deviceName}"` : '📡 Caster'}
      </Button>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default ChromecastButton;
