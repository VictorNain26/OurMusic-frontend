import { useEffect } from 'react';
import { authClient } from '../lib/authClient';

export const useAuth = () => {
  const {
    data: session,
    isPending,
    error,
    refetch,
  } = authClient.useSession({
    refetchOnWindowFocus: true, // On garde le focus pour l'UX instantané
  });

  const user = session?.user || null;
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!session?.expires) return;

    const expiresAt = new Date(session.expires).getTime();
    const now = Date.now();

    const refreshIn = Math.max(expiresAt - now - 60 * 1000, 10 * 1000); // minimum 10s pour éviter de spam

    const timer = setTimeout(() => {
      refetch();
    }, refreshIn);

    if (import.meta.env.DEV) {
      console.info(`[useAuth] Prochain refresh de session dans ${Math.round(refreshIn / 1000)}s`);
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
    signOut: authClient.signOut,
    sendVerificationEmail: authClient.sendVerificationEmail,
    resetPassword: authClient.resetPassword,
    refetch,
  };
};
