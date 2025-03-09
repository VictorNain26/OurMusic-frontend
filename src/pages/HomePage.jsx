// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import AzuracastPlayer from './../components/AzuracastPlayer';
import LoginModal from './../components/LoginModal';
import RegisterModal from './../components/RegisterModal';
import ChromecastButton from './../components/ChromecastButton';

const HomePage = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');

  // Vérifier si un token existe dans le localStorage au chargement de la page
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
      try {
        const decoded = jwt_decode(token);
        setUserRole(decoded.role || '');
      } catch (err) {
        console.error('Erreur lors du décodage du token :', err);
      }
    }
  }, []);

  const handleLoginSuccess = (token) => {
    setUser({ token });
    try {
      const decoded = jwt_decode(token);
      setUserRole(decoded.role || '');
    } catch (err) {
      console.error('Erreur lors du décodage du token :', err);
    }
  };

  const handleRegisterSuccess = (userData) => {
    // Vous pouvez décider ici comment traiter la réponse d'inscription
    setUser(userData);
    // Par exemple, si le backend retourne le token, décodez-le et stockez le rôle
    if (userData.token) {
      try {
        const decoded = jwt_decode(userData.token);
        setUserRole(decoded.role || '');
      } catch (err) {
        console.error('Erreur lors du décodage du token :', err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setUserRole('');
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
              {/* Lien visible uniquement pour les administrateurs */}
              {userRole === 'admin' && (
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
