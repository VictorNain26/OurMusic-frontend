// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import AzuracastPlayer from './../components/AzuracastPlayer';
import LoginModal from './../components/LoginModal';
import RegisterModal from './../components/RegisterModal';
import ChromecastButton from './../components/ChromecastButton';

const HomePage = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Vérifier si un token existe dans le localStorage au chargement de la page
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ici, vous pouvez décoder le token ou récupérer des infos utilisateur via le backend
      setUser({ token });
    }
  }, []);

  const handleLoginSuccess = (token) => {
    setUser({ token });
  };

  const handleRegisterSuccess = (user) => {
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <div>
          {user ? (
            <>
              <p>Bienvenue !</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ml-2"
              >
                Déconnexion
              </button>
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
        {/* Bouton Chromecast */}
        <ChromecastButton />
      </header>

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onRequestClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onRequestClose={() => setRegisterModalOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      <AzuracastPlayer />
    </div>
  );
};

export default HomePage;
