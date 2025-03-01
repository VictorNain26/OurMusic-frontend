/* global cast */
import AzuracastPlayer from './../components/AzuracastPlayer';

const HomePage = () => {
  const handleCast = async () => {
    try {
      const context = cast.framework.CastContext.getInstance();
      await context.requestSession();
      console.log("Session de cast établie.");
      // Ici, vous pouvez éventuellement charger le média sur le receiver
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
          Caster
        </button>
      </div>
    </div>
  );
};

export default HomePage;
