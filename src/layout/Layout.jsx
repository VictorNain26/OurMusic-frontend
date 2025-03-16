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
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col bg-white text-gray-800">
        <Header
          onLogin={() => setIsLoginOpen(true)}
          onRegister={() => setIsRegisterOpen(true)}
          onLogout={useAuthStore.getState().logout}
        />

        <LoginModal isOpen={isLoginOpen} onRequestClose={() => setIsLoginOpen(false)} />
        <RegisterModal isOpen={isRegisterOpen} onRequestClose={() => setIsRegisterOpen(false)} />

        <AnimatePresence mode="wait">
          <motion.main
            key="main-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex-1 w-full px-4 py-6 max-w-6xl mx-auto"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </>
  );
};

export default Layout;
