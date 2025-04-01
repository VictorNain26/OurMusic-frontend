import { authClient } from '../lib/authClient';

export const useAuth = () => {
  const { data: session, isLoading, refetch } = authClient.useSession();
  const { signOut, signIn, signUp } = authClient;

  const user = session?.user || null;
  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    refetch,
  };
};
