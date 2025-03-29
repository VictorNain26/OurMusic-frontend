import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PageWrapper from '../layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { API_BASE_URL } from '../utils/config';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token manquant');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Mot de passe trop court');
      return;
    }
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || 'Erreur inconnue');

      toast.success('Mot de passe réinitialisé avec succès !');
      navigate('/');
    } catch (err) {
      console.error('[ResetPassword Error]', err);
      toast.error(err.message || 'Erreur de réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="flex items-center justify-center min-h-screen bg-white">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">🔐 Nouveau mot de passe</h1>

        <div>
          <label className="block font-medium mb-1">Nouveau mot de passe</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Confirmer le mot de passe</label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          {loading ? 'Envoi en cours…' : 'Réinitialiser'}
        </Button>
      </form>
    </PageWrapper>
  );
};

export default ResetPasswordPage;
