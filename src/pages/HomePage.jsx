import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import AzuracastPlayer from '../components/AzuracastPlayer';
import LikedTracksList from '../components/LikedTracksList';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const HomePage = () => {
  const { user, authReady, fetchUser, logout } = useAuthStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />

      {/* 🔝 Barre d’en-tête */}
      <Header
        onLogin={() => setIsLoginOpen(true)}
        onRegister={() => setIsRegisterOpen(true)}
        onLogout={logout}
      />

      {/* 🔐 Modaux auth */}
      <LoginModal isOpen={isLoginOpen} onRequestClose={() => setIsLoginOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onRequestClose={() => setIsRegisterOpen(false)} />

      {/* 🎶 Player + morceaux likés */}
      <AzuracastPlayer />
      {user && <LikedTracksList />}
    </div>
  );
};

export default HomePage;
