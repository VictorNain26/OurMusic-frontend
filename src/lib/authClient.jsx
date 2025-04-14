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
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: 'Vérifiez votre adresse email',
        text: `Cliquez sur le lien pour vérifier votre email: ${url}`
      });
    },
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: 'Réinitialisez votre mot de passe',
        text: `Cliquez sur le lien pour réinitialiser votre mot de passe: ${url}`
      });
    }
  }
});

export const sendVerificationEmail = async (email) => {
  try {
    await authClient.sendVerificationEmail({
      email,
    });
  } catch (err) {
    console.error('[sendVerificationEmail]', err);
  }
};

export const sendResetPasswordEmail = async (email) => {
  try {
    await authClient.sendResetPassword({
      email,
    });
  } catch (err) {
    console.error('[sendResetPasswordEmail]', err);
  }
};
