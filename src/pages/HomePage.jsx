// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AzuracastPlayer from './../components/AzuracastPlayer';
import LoginModal from './../components/LoginModal';
import RegisterModal from './../components/RegisterModal';
import ChromecastButton from './../components/ChromecastButton';

const HomePage = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Au chargement, récupérer les infos de l'utilisateur depuis /api/auth/me
  useEffect(() => {
    fetch('https://ourmusic-api.ovh/api/auth/me', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : Promise.reject('Non authentifié'))
      .then((data) => setUserInfo(data))
      .catch((err) => {
        console.log("Utilisateur non authentifié", err);
        setUserInfo(null);
      });
  }, []);

  const handleLogout = () => {
    // Pour une déconnexion, vous pouvez appeler un endpoint logout côté backend
    // ou simplement supprimer les cookies via une redirection sur une route de déconnexion.
    // Ici, on redirige simplement vers la page d'accueil et on force le rechargement.
    document.cookie = "token=; Max-Age=0; path=/";
    setUserInfo(null);
    window.location.reload();
  };

  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <div>
          {userInfo ? (
            <>
              <p>Bienvenue, {userInfo.username || userInfo.email} !</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ml-2"
              >
                Déconnexion
              </button>
              {/* Lien réservé aux administrateurs */}
              {userInfo.role === 'admin' && (
                <Link
                  to="/spotify-refresh"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ml-2"
                >
                  Refresh Spotify
                </Link>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
              >
                Login
              </button>
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Register
              </button>
            </>
          )}
        </div>
        <ChromecastButton />
      </header>

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onRequestClose={() => setLoginModalOpen(false)}
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
