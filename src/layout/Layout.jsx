import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Header from '../components/Header';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { authClient } from '../lib/authClient.jsx';

const LoginModal = lazy(() => import('../components/LoginModal'));
const RegisterModal = lazy(() => import('../components/RegisterModal'));
const ResetPasswordModal = lazy(() => import('../components/ResetPasswordModal'));

const Layout = ({ children }) => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isResetPasswordOpen, setResetPasswordOpen] = useState(false);

  const { isLoading, refetch } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const { error } = await authClient.verifyEmail({ query: { token } });
        if (error) throw new Error(error.message);

        toast.success('🎉 Email vérifié avec succès !');
      } catch (err) {
        console.error('[Layout → VerifyEmail]', err);
        toast.error(err.message || 'Erreur de vérification');
      } finally {
        await refetch();
        searchParams.delete('token');
        setSearchParams(searchParams, { replace: true });
      }
    };

    verifyEmail();
  }, [searchParams, setSearchParams, refetch]);

  useEffect(() => {
    const resetToken = searchParams.get('resetToken');
    if (resetToken) setResetPasswordOpen(true);
  }, [searchParams]);

  useEffect(() => {
    const emailVerified = searchParams.get('email_verified');
    const passwordReset = searchParams.get('password_reset');

    if (emailVerified === 'success') {
      toast.success('🎉 Email vérifié avec succès !');
      searchParams.delete('email_verified');
      setSearchParams(searchParams, { replace: true });
    }

    if (passwordReset === 'success') {
      toast.success('🔒 Mot de passe réinitialisé avec succès !');
      searchParams.delete('password_reset');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />

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
