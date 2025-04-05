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
              authClient.sendVerificationEmail({
                email: err.context.email,
                callbackURL: window.location.origin,
              }).then(() => {
                toast.success('Email de vérification renvoyé !');
                toast.dismiss(t.id);
              }).catch((error) => {
                console.error('[Global Resend Verification]', error);
                toast.error('Erreur lors de l’envoi');
              });
            }}
          >
            Renvoyer
          </Button>
        </span>
      ), { duration: 8000 });
    }
  }
});
