import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Header from '../components/Header';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../utils/config';

const LoginModal = lazy(() => import('../components/LoginModal'));
const RegisterModal = lazy(() => import('../components/RegisterModal'));
const ResetPasswordModal = lazy(() => import('../components/ResetPasswordModal'));

const Layout = ({ children }) => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isResetPasswordOpen, setResetPasswordOpen] = useState(false);

  const { user, isLoading, refetch } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ Vérification email automatique depuis URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/email/verify?token=${token}`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.error || 'Erreur de vérification');
        }

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

  // ✅ Reset password modal automatique (optionnel, pas obligatoire)
  useEffect(() => {
    const resetToken = searchParams.get('resetToken');
    if (resetToken) {
      setResetPasswordOpen(true);
    }
  }, [searchParams]);

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
