import React, { useEffect, useState } from 'react';
import Button from './ui/Button';

const ChromecastButton = () => {
  const [castAvailable, setCastAvailable] = useState(false);
  const [error, setError] = useState(null);

  // Ton ID officiel de Web Receiver App (pas besoin d'en créer un perso si tu utilises l'app par défaut)
  const RECEIVER_APP_ID = '4A922B9B';

  // URL de ton stream AzuraCast
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
      mediaInfo.metadata = new chrome.cast.media.MusicTrackMediaMetadata();
      mediaInfo.metadata.title = 'OurMusic Radio';
      mediaInfo.metadata.artist = 'OurMusic';

      const request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      session.loadMedia(request).then(
        () => console.info('[Chromecast] Stream envoyé avec succès 🚀'),
        (errorCode) => {
          console.error('[Chromecast] Erreur loadMedia', errorCode);
          setError('Erreur lors de l’envoi du flux.');
        }
      );

    } catch (err) {
      console.error('[Chromecast] Erreur session:', err);
      setError('Erreur lors de la connexion Chromecast.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleCastClick}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        Caster
      </Button>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default ChromecastButton;
