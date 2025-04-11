import { createAuthClient } from 'better-auth/react';
import { API_BASE_URL } from '../utils/config';
import { toast } from 'react-hot-toast';
import { SITE_BASE_URL } from '../utils/config';

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
});

export const sendVerificationEmail = async (email) => {
  try {
    await authClient.sendVerificationEmail({
      email,
      callbackURL: "http://localhost:8080",
    });
  } catch (err) {
    console.error('[sendVerificationEmail]', err);
  }
};
