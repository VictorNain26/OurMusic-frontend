import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AzuracastPlayer from '../components/AzuracastPlayer';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import ChromecastButton from '../components/ChromecastButton';
import { apiFetch } from '../utils/api';
import { getAccessToken, setAccessToken, logoutFetch } from '../utils/api';

const HomePage = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Au chargement, si on a un accessToken, on tente /api/auth/me
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      apiFetch('https://ourmusic-api.ovh/api/auth/me')
        .then((data) => setUserInfo(data))
        .catch((err) => {
          console.log("Utilisateur non authentifié ou token expiré:", err);
          setUserInfo(null);
          // Possibilité de retirer le token local si on veut
          setAccessToken(null);
        });
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Efface le refresh cookie
      await logoutFetch();
    } catch (err) {
      console.log('Erreur logout :', err);
    }
    // Effacer l’access token local
    setAccessToken(null);
    setUserInfo(null);
  };

  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <div>
          {userInfo ? (
            <div className="flex items-center gap-3">
              {/* Nom d'utilisateur à la place des boutons */}
              <span className="font-semibold">
                {userInfo.username}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Déconnexion
              </button>

              {userInfo.role === 'admin' && (
                <Link
                  to="/spotify-refresh"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Refresh Spotify
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Login
              </button>
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Register
              </button>
            </div>
          )}
        </div>

        <ChromecastButton />
      </header>

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onRequestClose={() => setLoginModalOpen(false)}
          onLoginSuccess={(data) => {
            // data contient { accessToken, user: {...} }
            setUserInfo(data.user);
            setLoginModalOpen(false);
          }}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onRequestClose={() => setRegisterModalOpen(false)}
        />
      )}

      <AzuracastPlayer />
    </div>
  );
};

export default HomePage;
