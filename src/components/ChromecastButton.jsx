import React, { useEffect, useState } from 'react';
import Button from './ui/Button';

const ChromecastButton = () => {
  const [castAvailable, setCastAvailable] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initCastApi = () => {
      if (!window.cast || !window.cast.framework) return;

      const context = cast.framework.CastContext.getInstance();
      context.setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (event) => {
          if (event.sessionState === cast.framework.SessionState.NO_SESSION) {
            console.log('[Chromecast] Aucune session active, tentative de reconnexion...');
            context.requestSession().catch((err) =>
              console.error('[Chromecast] Reconnexion échouée:', err)
            );
          }
        }
      );

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

  const handleCastClick = () => {
    if (!castAvailable) {
      alert('Chromecast non disponible.');
      return;
    }

    const context = cast.framework.CastContext.getInstance();
    context.requestSession()
      .then(() => {
        console.log('[Chromecast] Session démarrée avec succès.');
      })
      .catch((err) => {
        console.error('[Chromecast] Erreur lors du cast :', err);
        alert('Impossible de lancer le cast.');
      });
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
