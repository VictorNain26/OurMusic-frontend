import { useEffect } from 'react';
import { authClient } from '../lib/authClient.jsx';

export const useAuth = () => {
  const {
    data: session,
    isPending,
    error,
    refetch,
  } = authClient.useSession(); // ✅ Simplifié : on retire refetchOnWindowFocus

  const user = session?.user || null;
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!session?.expires) return;

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
  }, [session?.expires, refetch]);

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
