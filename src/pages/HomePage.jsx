/* global cast chrome */
import { useEffect } from 'react';
import AzuracastPlayer from './../components/AzuracastPlayer';

const HomePage = () => {
  useEffect(() => {
    // Cette fonction est appelée par le SDK Cast lorsque celui-ci est disponible
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        const context = cast.framework.CastContext.getInstance();
        context.setOptions({
          receiverApplicationId: '4A922B9B', // Remplacez par l'ID de votre receiver personnalisé
          autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });
        console.log("SDK Cast initialisé.");
      }
    };
  }, []);

  const handleCast = async () => {
    try {
      const context = cast.framework.CastContext.getInstance();
      await context.requestSession();
      console.log("Session de cast établie.");
      // Vous pouvez ajouter ici un chargement de média vers le receiver si nécessaire
    } catch (error) {
      console.error("Erreur lors du lancement du cast :", error);
    }
  };

  return (
    <div>
      <AzuracastPlayer />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          onClick={handleCast}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#4285F4',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Connecter au Receiver
        </button>
      </div>
    </div>
  );
};

export default HomePage;
