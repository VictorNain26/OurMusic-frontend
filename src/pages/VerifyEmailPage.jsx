import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PageWrapper from '../layout/PageWrapper';
import { API_BASE_URL } from '../utils/config';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      toast.error('Token de vérification manquant.');
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/email/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || 'Échec de la vérification.');
        }

        setStatus('success');
        toast.success('✅ Email vérifié avec succès !');
        setTimeout(() => navigate('/'), 3000);
      })
      .catch((err) => {
        console.error('[VerifyEmail Error]', err);
        toast.error(err.message || 'Erreur de vérification');
        setStatus('error');
      });
  }, [searchParams, navigate]);

  const renderContent = () => {
    if (status === 'loading') return <p className="text-gray-600">Vérification en cours...</p>;
    if (status === 'success') return <p className="text-green-600">Votre email a été vérifié ! Redirection…</p>;
    return <p className="text-red-600">Échec de la vérification. Lien invalide ou expiré.</p>;
  };

  return (
    <PageWrapper className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center max-w-md p-4">{renderContent()}</div>
    </PageWrapper>
  );
};

export default VerifyEmailPage;
