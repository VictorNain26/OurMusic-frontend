import { createAuthClient } from 'better-auth/react';
import { API_BASE_URL } from '../utils/config';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,

  onError: (err) => {
    if (import.meta.env.DEV) {
      console.warn('[authClient Error]', err);
    }

    if (err?.status === 403 && err?.context?.email) {
      toast((t) => (
        <span>
          Veuillez vérifier votre email.
          <Button
            className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded"
            onClick={() => {
              sendVerificationEmail(err.context.email);
              toast.dismiss(t.id);
            }}
          >
            Renvoyer
          </Button>
        </span>
      ), { duration: 8000 });
    }
  },

  // ✅ Redirection propre après déconnexion
  onSignOut: () => {
    toast.success('Vous avez été déconnecté.');
    window.location.href = window.location.origin;
  },
});

export const sendVerificationEmail = async (email) => {
  try {
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: window.location.origin,
    });

    if (error) throw new Error(error.message);

    toast.success('📨 Email de vérification renvoyé !');
  } catch (err) {
    console.error('[sendVerificationEmail]', err);
    toast.error(err.message || 'Erreur lors de l’envoi');
  }
};
