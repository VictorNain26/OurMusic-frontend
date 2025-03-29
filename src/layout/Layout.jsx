import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import { useAuthStore } from '../store/authStore';
import { AnimatePresence, motion } from 'framer-motion';

const LoginModal = lazy(() => import('../components/LoginModal'));
const RegisterModal = lazy(() => import('../components/RegisterModal'));

const Layout = ({ children }) => {
  const { user, authReady, fetchUser, logout } = useAuthStore();
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // Initial fetch si nécessaire
  useEffect(() => {
    if (!authReady) fetchUser();
  }, [authReady, fetchUser]);

  // Ferme les modals si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      setLoginOpen(false);
      setRegisterOpen(false);
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
        onLogin={() => setLoginOpen(true)}
        onRegister={() => setRegisterOpen(true)}
        onLogout={logout}
      />

      <AnimatePresence mode="wait">
        <motion.main
          key="layout-main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <Suspense fallback={null}>
        <LoginModal isOpen={isLoginOpen} onRequestClose={() => setLoginOpen(false)} />
        <RegisterModal isOpen={isRegisterOpen} onRequestClose={() => setRegisterOpen(false)} />
      </Suspense>
    </>
  );
};

export default Layout;
