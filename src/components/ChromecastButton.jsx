import React, { useEffect, useState } from 'react';
import Button from './ui/Button';
import { toast } from 'react-hot-toast';

const ChromecastButton = () => {
  const [castAvailable, setCastAvailable] = useState(false);
  const [deviceName, setDeviceName] = useState(null);

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
        toast.error('Erreur de chargement Chromecast.');
      };
      document.body.appendChild(script);
    };

    loadCastScript();
  }, []);

  const handleCastClick = async () => {
    if (!castAvailable) {
      toast.error('Chromecast non disponible.');
      return;
    }

    const context = cast.framework.CastContext.getInstance();
    const sessionState = context.getSessionState();

    if (
      sessionState === cast.framework.SessionState.SESSION_STARTED ||
      sessionState === cast.framework.SessionState.SESSION_RESUMED
    ) {
      console.info('[Chromecast] Session déjà active, pas besoin de relancer.');
      return; // ✅ Session déjà active → ne rien faire
    }

    try {
      const session = await context.requestSession();
      if (!session) {
        console.warn('[Chromecast] Session annulée par l’utilisateur.');
        return;
      }

      const mediaInfo = new chrome.cast.media.MediaInfo(STREAM_URL, 'audio/mpeg');
      mediaInfo.streamType = chrome.cast.media.StreamType.LIVE; // Flux radio continu

      const request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      await session.loadMedia(request);

      const device = session?.getCastDevice()?.friendlyName || 'Chromecast';
      setDeviceName(device);

    } catch (err) {
      console.error('[Chromecast] Erreur session:', err);
      toast.error('Erreur de connexion à Chromecast.');
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
    </div>
  );
};

export default ChromecastButton;
