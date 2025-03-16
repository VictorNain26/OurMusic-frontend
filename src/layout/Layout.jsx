import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import { useAuthStore } from '../store/authStore';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  const { user } = useAuthStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // 🔐 Ferme modales si utilisateur connecté
  useEffect(() => {
    if (user) {
      setIsLoginOpen(false);
      setIsRegisterOpen(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* ✅ Toasts globaux */}
      <Toaster position="top-right" />

      {/* 🔝 En-tête fixe */}
      <Header
        onLogin={() => setIsLoginOpen(true)}
        onRegister={() => setIsRegisterOpen(true)}
        onLogout={useAuthStore.getState().logout}
      />

      {/* 🔐 Modales Auth */}
      <LoginModal isOpen={isLoginOpen} onRequestClose={() => setIsLoginOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onRequestClose={() => setIsRegisterOpen(false)} />

      {/* 📦 Contenu principal */}
      <main className="flex-1 w-full px-4 py-6 max-w-6xl mx-auto">
        {children}
      </main>

      {/* 📎 Footer (optionnel) */}
      {/* <footer className="text-sm text-gray-500 text-center py-4">© OurMusic 2025</footer> */}
    </div>
  );
};

export default Layout;
