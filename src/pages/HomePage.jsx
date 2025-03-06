/* global cast */
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import AzuracastPlayer from './../components/AzuracastPlayer';

const HomePage = () => {
  const { isAuthenticated, user, logout } = useAuth0();
  const navigate = useNavigate();

  const handleCast = async () => {
    try {
      const context = cast.framework.CastContext.getInstance();
      await context.requestSession();
      console.log("Session de cast établie.");
    } catch (error) {
      console.error("Erreur lors du lancement du cast :", error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem' }}>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: '1rem' }}>Bonjour, {user.name}</span>
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                backgroundColor: '#EA4335',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                backgroundColor: '#34A853',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate('/register')}
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
              Inscription
            </button>
          </>
        )}
      </div>

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