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

      const session = context.getCurrentSession();
      if (session && session.getSessionId()) {
        const device = session.getCastDevice()?.friendlyName || 'Chromecast';
        setDeviceName(device);
      }

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

    if (window.cast && window.cast.framework) {
      initCastApi();
    } else {
      window.__onGCastApiAvailable = function (isAvailable) {
        if (isAvailable) initCastApi();
      };
    }
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
      const session = context.getCurrentSession();
      if (session) {
        session.endSession(true);
        setDeviceName(null);
        toast.success('Déconnecté du Chromecast.');
      }
      return;
    }

    try {
      const session = await context.requestSession();
      if (!session) {
        console.warn('[Chromecast] Session annulée par l’utilisateur.');
        return;
      }

      const mediaInfo = new chrome.cast.media.MediaInfo(STREAM_URL, 'audio/mpeg');
      mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;

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
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {deviceName ? `✖️ Déconnexion de "${deviceName}"` : '📡 Caster'}
      </Button>
    </div>
  );
};

export default ChromecastButton;
