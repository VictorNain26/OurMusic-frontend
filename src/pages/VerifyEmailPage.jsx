import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PageWrapper from '../layout/PageWrapper';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      toast.error('Token manquant dans l’URL');
      return;
    }

    fetch('https://ourmusic-api.ovh/api/auth/email/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setStatus('success');
          toast.success('Email vérifié avec succès !');
          setTimeout(() => navigate('/'), 3000);
        } else {
          throw new Error(data?.message || 'Erreur');
        }
      })
      .catch((err) => {
        console.error('[VerifyEmail Error]', err);
        toast.error('Échec de la vérification de l’email');
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
