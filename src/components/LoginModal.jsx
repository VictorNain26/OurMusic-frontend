import React, { useState, useEffect } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import ModalWrapper from './ui/ModalWrapper';
import { useAuthStore } from '../store/authStore';

const LoginModal = ({ isOpen, onRequestClose }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, error, loading, clearError } = useAuthStore();

  useEffect(() => {
    if (!isOpen) {
      setForm({ email: '', password: '' });
      clearError();
    }
  }, [isOpen, clearError]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(form.email, form.password);
    if (success) onRequestClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2 className="text-2xl font-semibold mb-4 text-center">Se connecter</h2>

      {error && <p className="text-red-500 mb-3 text-sm text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <Input
            name="email"
            type="email"
            placeholder="Adresse email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Mot de passe</label>
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>
    </ModalWrapper>
  );
};

export default LoginModal;
