// src/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import { useAuthStore } from '../store/authStore';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const { user } = useAuthStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoginOpen(false);
      setIsRegisterOpen(false);
    }
  }, [user]);

  return (
    <>
      {/* ✅ Toasts globaux */}
      <Toaster position="top-right" />
      <AnimatePresence mode="wait">
        <motion.div
          key="layout"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="min-h-screen flex flex-col bg-white text-gray-800"
        >
          {/* 🔝 En-tête animé */}
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
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default Layout;
