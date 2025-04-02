import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PageWrapper from '../layout/PageWrapper';
import { authClient } from '../lib/authClient';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      toast.error('Token de vérification manquant.');
      return;
    }

    authClient
      .verifyEmail({ token })
      .then(({ error }) => {
        if (error) throw new Error(error.message);
        setStatus('success');
        toast.success('✅ Email vérifié avec succès !');
        setTimeout(() => navigate('/'), 2500);
      })
      .catch((err) => {
        console.error('[VerifyEmail Error]', err);
        toast.error(err.message || 'Erreur de vérification');
        setStatus('error');
      });
  }, [searchParams, navigate]);

  return (
    <PageWrapper className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center max-w-md p-4">
        {status === 'loading' && <p className="text-gray-600">Vérification en cours...</p>}
        {status === 'success' && <p className="text-green-600">Votre email a été vérifié ! Redirection…</p>}
        {status === 'error' && <p className="text-red-600">Échec de la vérification. Lien invalide ou expiré.</p>}
      </div>
    </PageWrapper>
  );
};

export default VerifyEmailPage;
