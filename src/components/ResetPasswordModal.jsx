import React, { useState, useEffect } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import ModalWrapper from './ui/ModalWrapper';
import { authClient } from '../lib/authClient.jsx';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const ResetPasswordModal = ({ isOpen, onRequestClose }) => {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('resetToken');

  useEffect(() => {
    if (!isOpen) {
      setForm({ password: '', confirmPassword: '' });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const res = await authClient.resetPassword({
        token: resetToken,
        password: form.password,
      });

      if (res.error) {
        toast.error(res.error.message || 'Erreur lors de la réinitialisation');
        return;
      }

      toast.success('Mot de passe réinitialisé avec succès !');
      onRequestClose();
    } catch (err) {
      console.error('[ResetPasswordModal → handleSubmit]', err);
      toast.error(err.message || 'Erreur inattendue');
    }
  };

  if (!resetToken) return null;

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2 className="text-2xl font-semibold mb-4 text-center">🔒 Réinitialiser le mot de passe</h2>

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
          <label className="block mb-1 font-medium">Confirmez le mot de passe</label>
          <Input
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          Réinitialiser le mot de passe
        </Button>
      </form>
    </ModalWrapper>
  );
};

export default ResetPasswordModal;
