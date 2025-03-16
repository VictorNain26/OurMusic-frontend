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
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
          {children}
        </main>
        <LoginModal isOpen={isLoginOpen} onRequestClose={() => setIsLoginOpen(false)} />
        <RegisterModal isOpen={isRegisterOpen} onRequestClose={() => setIsRegisterOpen(false)} />
      </div>
    </>
  );
};

export default Layout;
