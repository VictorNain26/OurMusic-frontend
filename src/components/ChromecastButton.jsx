import React, { useEffect, useState } from 'react';
import Button from './ui/Button';

const ChromecastButton = () => {
  const [castAvailable, setCastAvailable] = useState(false);
  const [error, setError] = useState(null);

  // 👇 Ton Web Receiver Application ID Google Cast
  const RECEIVER_APP_ID = '4A922B9B';

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
        console.error('[Chromecast] Échec du chargement du script');
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
      await context.requestSession();
      console.info('[Chromecast] Session démarrée avec succès 🎯');
    } catch (err) {
      console.error('[Chromecast] Erreur session:', err);
      alert('Erreur lors de la connexion Chromecast.');
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
