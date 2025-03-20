import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const { user, authReady, fetchUser } = useAuthStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    if (!authReady) fetchUser();
  }, [authReady, fetchUser]);

  useEffect(() => {
    if (user) {
      setIsLoginOpen(false);
      setIsRegisterOpen(false);
    }
  }, [user]);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <Header
        onLogin={() => setIsLoginOpen(true)}
        onRegister={() => setIsRegisterOpen(true)}
        onLogout={useAuthStore.getState().logout}
      />

      <AnimatePresence mode="wait">
        <motion.main
          key="main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <LoginModal isOpen={isLoginOpen} onRequestClose={() => setIsLoginOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onRequestClose={() => setIsRegisterOpen(false)} />
    </>
  );
};

export default Layout;
