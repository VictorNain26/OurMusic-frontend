import React, { useEffect, useState } from 'react';
import ModalWrapper from './ui/ModalWrapper';
import Input from './ui/Input';
import Button from './ui/Button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authClient } from '../lib/authClient.jsx';

const ResetPasswordModal = ({ isOpen, onRequestClose }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token && isOpen) {
      toast.error('Token manquant pour réinitialiser le mot de passe.');
      onRequestClose();
    }
  }, [token, isOpen, onRequestClose]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      toast.error('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    if (form.password !== form.confirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        token,
        password: form.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('🔐 Mot de passe réinitialisé avec succès !');

      setTimeout(() => {
        onRequestClose();
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('[ResetPasswordModal Error]', err);
      toast.error(err.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2 className="text-2xl font-semibold mb-4 text-center">🔐 Réinitialiser le mot de passe</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nouveau mot de passe</label>
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Confirmer le mot de passe</label>
          <Input
            name="confirm"
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          {loading ? 'Réinitialisation...' : 'Réinitialiser'}
        </Button>
      </form>
    </ModalWrapper>
  );
};

export default ResetPasswordModal;
