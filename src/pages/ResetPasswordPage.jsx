import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PageWrapper from '../layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authClient } from '../lib/authClient';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) return toast.error('Token manquant');
    if (password.length < 6) return toast.error('Mot de passe trop court (min 6 caractères)');
    if (password !== confirm) return toast.error('Les mots de passe ne correspondent pas');

    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({ token, password });
      if (error) throw new Error(error.message);

      toast.success('🔐 Mot de passe réinitialisé !');
      setTimeout(() => navigate('/'), 2500);
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
