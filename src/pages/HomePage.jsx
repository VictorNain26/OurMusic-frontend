import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AzuracastPlayer from '../components/AzuracastPlayer';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import ChromecastButton from '../components/ChromecastButton';
import { apiFetch } from '../utils/api';
import { getAccessToken, setAccessToken, logoutFetch } from '../utils/api';
import LikedTracksList from '../components/LikedTracksList';

const HomePage = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [likedTracks, setLikedTracks] = useState([]);

  const refreshLikedTracks = async () => {
    if (!getAccessToken()) return;
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/track/like');
      setLikedTracks(data.likedTracks || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des morceaux likés :", err);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      apiFetch('https://ourmusic-api.ovh/api/auth/me')
        .then((data) => {
          setUserInfo(data);
          refreshLikedTracks();
        })
        .catch((err) => {
          console.log("Utilisateur non authentifié ou token expiré:", err);
          setUserInfo(null);
          setAccessToken(null);
        });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logoutFetch();
    } catch (err) {
      console.log('Erreur logout :', err);
    }
    setAccessToken(null);
    setUserInfo(null);
  };

  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <div>
          {userInfo ? (
            <div className="flex items-center gap-3">
              <span className="font-semibold">{userInfo.username}</span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                Déconnexion
              </button>
              {userInfo.role === 'admin' && (
                <Link to="/spotify-refresh" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                  Refresh Spotify
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => setLoginModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Login
              </button>
              <button onClick={() => setRegisterModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
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
            setUserInfo(data.user);
            setLoginModalOpen(false);
            refreshLikedTracks();
          }}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onRequestClose={() => setRegisterModalOpen(false)}
        />
      )}

      <AzuracastPlayer onLikeChange={refreshLikedTracks} likedTracks={likedTracks} setLikedTracks={setLikedTracks} />

      {userInfo && <LikedTracksList likedTracks={likedTracks} setLikedTracks={setLikedTracks} />}
    </div>
  );
};

export default HomePage;