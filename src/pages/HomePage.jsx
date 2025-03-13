import React, { useState, useEffect } from 'react';
import AzuracastPlayer from '../components/AzuracastPlayer';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import { getAccessToken, apiFetch } from '../utils/api';
import LikedTracksList from '../components/LikedTracksList';
import { Toaster, toast } from 'react-hot-toast';

const HomePage = () => {
  const { userInfo, setUserInfo, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [likedTracks, setLikedTracks] = useState([]);

  const refreshLikedTracks = async () => {
    if (!getAccessToken()) return;
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/track/like');
      setLikedTracks(data.likedTracks || []);
    } catch (err) {
      console.error("Erreur liked tracks :", err);
    }
  };

  useEffect(() => {
    if (userInfo) refreshLikedTracks();
  }, [userInfo]);

  return (
    <div>
      <Toaster position="top-right" />
      <Header
        userInfo={userInfo}
        onLogin={() => setIsLoginOpen(true)}
        onRegister={() => setIsRegisterOpen(true)}
        onLogout={logout}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onRequestClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(data) => {
          setUserInfo(data.user);
          refreshLikedTracks();
          setIsLoginOpen(false);
          toast.success('Connexion réussie');
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onRequestClose={() => setIsRegisterOpen(false)}
      />

      <AzuracastPlayer
        likedTracks={likedTracks}
        setLikedTracks={setLikedTracks}
        onLikeChange={refreshLikedTracks}
      />

      {userInfo && <LikedTracksList likedTracks={likedTracks} setLikedTracks={setLikedTracks} />}
    </div>
  );
};

export default HomePage;
