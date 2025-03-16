// src/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import { useAuthStore } from '../store/authStore';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const { user, authReady } = useAuthStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [readyForAnimation, setReadyForAnimation] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoginOpen(false);
      setIsRegisterOpen(false);
    }
  }, [user]);

  useEffect(() => {
    if (authReady) {
      const timer = setTimeout(() => setReadyForAnimation(true), 100);
      return () => clearTimeout(timer);
    }
  }, [authReady]);

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col bg-white text-gray-800">
        {readyForAnimation ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <Header
                onLogin={() => setIsLoginOpen(true)}
                onRegister={() => setIsRegisterOpen(true)}
                onLogout={useAuthStore.getState().logout}
              />
            </motion.div>

            <motion.main
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.1 }}
              className="flex-1 w-full px-4 py-6 max-w-6xl mx-auto"
            >
              {children}
            </motion.main>
          </>
        ) : (
          <>
            <Header
              onLogin={() => setIsLoginOpen(true)}
              onRegister={() => setIsRegisterOpen(true)}
              onLogout={useAuthStore.getState().logout}
            />
            <main className="flex-1 w-full px-4 py-6 max-w-6xl mx-auto">{children}</main>
          </>
        )}

        <LoginModal isOpen={isLoginOpen} onRequestClose={() => setIsLoginOpen(false)} />
        <RegisterModal isOpen={isRegisterOpen} onRequestClose={() => setIsRegisterOpen(false)} />
      </div>
    </>
  );
};

export default Layout;
