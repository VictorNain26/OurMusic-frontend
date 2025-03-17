import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const { user, authReady, fetchUser, logout } = useAuthStore();
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
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto"
      >
        {children}
      </motion.main>
      <LoginModal isOpen={isLoginOpen} onRequestClose={() => setIsLoginOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onRequestClose={() => setIsRegisterOpen(false)} />
    </>
  );
};

export default Layout;
