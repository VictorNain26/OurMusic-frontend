import React, { useState } from 'react';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import { useAuthStore } from '../store/authStore';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  const { logout } = useAuthStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      <Header
        onLogin={() => setIsLoginOpen(true)}
        onRegister={() => setIsRegisterOpen(true)}
        onLogout={logout}
      />
      <LoginModal isOpen={isLoginOpen} onRequestClose={() => setIsLoginOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onRequestClose={() => setIsRegisterOpen(false)} />
      <main className="p-4">{children}</main>
    </div>
  );
};

export default Layout;
