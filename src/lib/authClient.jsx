import { createAuthClient } from 'better-auth/react';
import { API_BASE_URL } from '../utils/config';
import { toast } from 'react-hot-toast';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  onError: (err) => {
    if (import.meta.env.DEV) {
      console.warn('[authClient Error]', err);
    }
    if (err?.status === 403 && err?.context?.email) {
      toast.error('Veuillez vérifier votre email.');
    }
  },
  onSignOut: () => {
    toast.success('Vous avez été déconnecté.');
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
});
