// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AzuracastPlayer from '../components/AzuracastPlayer';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import ChromecastButton from '../components/ChromecastButton';
import { apiFetch } from '../utils/api';
import { getCookie } from '../utils/auth';

const HomePage = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Si le cookie d'authentification est présent, on appelle /api/auth/me
    if (getCookie('token')) {
      apiFetch('https://ourmusic-api.ovh/api/auth/me')
        .then((data) => setUserInfo(data))
        .catch((err) => {
          console.log("Utilisateur non authentifié", err);
          setUserInfo(null);
        }
      );
    }
  }, []);

  const handleLogout = () => {
    // Pour la déconnexion, on peut supprimer le cookie
    document.cookie = "token=; Max-Age=0; path=/";
    setUserInfo(null);
    window.location.reload();
  };

  return (
    <div>
      <header className="flex justify-between items-center p-4">
        {/* 
          Si userInfo existe, afficher le nom d'utilisateur 
          + le bouton de déconnexion et le lien SpotifyRefresh (si admin).
          Sinon, afficher Login / Register. 
        */}
        <div>
          {userInfo ? (
            <div className="flex items-center gap-3">
              {/* Nom d'utilisateur à la place des boutons */}
              <span className="font-semibold">
                {userInfo.username || userInfo.email}
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
            setUserInfo(data.user || data);
            setLoginModalOpen(false);
          }}
          shouldCloseOnOverlayClick={true}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onRequestClose={() => setRegisterModalOpen(false)}
          shouldCloseOnOverlayClick={true}
        />
      )}

      <AzuracastPlayer />
    </div>
  );
};

export default HomePage;
