// src/components/ChromecastButton.jsx
import React, { useEffect, useState } from 'react';

const ChromecastButton = () => {
  const [castAvailable, setCastAvailable] = useState(false);

  useEffect(() => {
    // Charger le SDK Google Cast s'il n'est pas déjà présent
    if (!window.cast || !window.cast.framework) {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
      script.async = true;
      script.onload = initCastApi;
      document.body.appendChild(script);
    } else {
      initCastApi();
    }
  }, []);

  const initCastApi = () => {
    if (window.cast && window.cast.framework) {
      setCastAvailable(true);
    }
  };

  const handleCastClick = () => {
    if (!castAvailable) {
      alert('Chromecast n\'est pas disponible pour le moment.');
      return;
    }
    // Lancer une session Chromecast
    const context = cast.framework.CastContext.getInstance();
    context.setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
    context.requestSession().then(() => {
      console.log('Session Chromecast lancée.');
    }).catch((err) => {
      console.error('Erreur lors du lancement de la session Chromecast :', err);
    });
  };

  return (
    <button
      onClick={handleCastClick}
      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
    >
      Caster
    </button>
  );
};

export default ChromecastButton;
