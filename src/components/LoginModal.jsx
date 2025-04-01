import React, { useState, useEffect } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import ModalWrapper from './ui/ModalWrapper';
import { authClient } from '../lib/authClient';

const LoginModal = ({ isOpen, onRequestClose }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { signIn, isPending, error, clearError } = authClient;

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
    const res = await signIn.email({
      email: form.email,
      password: form.password
    });

    if (!res.error) {
      onRequestClose();
    }
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
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          {isPending ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>
    </ModalWrapper>
  );
};

export default LoginModal;
