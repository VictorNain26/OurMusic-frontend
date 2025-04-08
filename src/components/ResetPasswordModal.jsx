import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Header from '../components/Header';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { sendVerificationEmail } from '../lib/authClient.jsx';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'; // 🆕

const Layout = ({ children }) => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isResetPasswordOpen, setResetPasswordOpen] = useState(false);

  const { user, isLoading, refetch } = useAuth();
  const [cooldown, setCooldown] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams(); // 🆕
  const location = useLocation(); // 🆕
  const navigate = useNavigate(); // 🆕

  // ✅ Toast confirmation email vérifié
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      toast.success('✅ Email vérifié avec succès !');
    }
  }, [searchParams]);

  // ✅ Nettoyage global des query params après toast éventuel
  useEffect(() => {
    if (searchParams.size > 0) {
      const paramsToKeep = ['resetToken']; // tu gardes que resetToken pour le modal reset
      const cleanParams = new URLSearchParams();

      for (const [key, value] of searchParams.entries()) {
        if (paramsToKeep.includes(key)) {
          cleanParams.set(key, value);
        }
      }

      if (cleanParams.toString() !== searchParams.toString()) {
        navigate(`${location.pathname}${cleanParams.toString() ? `?${cleanParams.toString()}` : ''}`, { replace: true });
      }
    }
  }, [location, searchParams, navigate]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (user && !user.emailVerified) {
      toast.error(
        (t) => (
          <span className="flex items-center">
            ⚠️ Vérifiez votre email !
            <Button
              onClick={async () => {
                await sendVerificationEmail(user.email);
                setCooldown(30);
                toast.dismiss(t.id);
              }}
              className="ml-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1"
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Attendez ${cooldown}s` : 'Renvoyer'}
            </Button>
          </span>
        ),
        { duration: 7000 }
      );
    }
  }, [user, cooldown]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="w-12 h-12 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <Header
            onLogin={() => setLoginOpen(true)}
            onRegister={() => setRegisterOpen(true)}
            onLogout={refetch}
            user={user}
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
            <ResetPasswordModal isOpen={isResetPasswordOpen} onRequestClose={() => setResetPasswordOpen(false)} />
          </Suspense>
        </>
      )}
    </>
  );
};

export default Layout;
