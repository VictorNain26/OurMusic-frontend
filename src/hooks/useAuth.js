import { authClient } from '../lib/authClient';

export const useAuth = () => {
  const {
    data: session,
    isPending,
    error,
    refetch,
  } = authClient.useSession();

  const user = session?.user || null;
  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading: isPending,
    error,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: authClient.signOut,
    refetch,
  };
};
