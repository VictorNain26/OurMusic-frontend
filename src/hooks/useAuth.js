import { useEffect } from 'react';
import { authClient } from '../lib/authClient.jsx';

export const useAuth = () => {
  const {
    data: session,
    isPending,
    error,
    refetch,
  } = authClient.useSession();

  const user = session?.user || null;
  const isAuthenticated = !!user;

  // 🔁 Refresh automatique avant expiration du token
  useEffect(() => {
    if (!session?.expires || !isAuthenticated) return;

    const expiresAt = new Date(session.expires).getTime();
    const now = Date.now();
    const refreshIn = Math.max(expiresAt - now - 60 * 1000, 10 * 1000);

    const timer = setTimeout(() => {
      refetch();
    }, refreshIn);

    if (import.meta.env.DEV) {
      console.info(`[useAuth] Prochain refresh dans ${Math.round(refreshIn / 1000)}s`);
    }

    return () => clearTimeout(timer);
  }, [session?.expires, isAuthenticated, refetch]);

  // 🔁 Refresh quand l’onglet revient en focus ou que l’utilisateur est de retour en ligne
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    const handleOnline = () => {
      refetch();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [refetch]);

  return {
    user,
    isAuthenticated,
    isLoading: isPending,
    error,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: async () => {
      try {
        authClient.signOut();
        refetch();
      } catch (err) {
        console.error('[useAuth → signOut]', err);
      }
    },
    sendVerificationEmail: authClient.sendVerificationEmail,
    resetPassword: authClient.resetPassword,
    refetch,
  };
};
