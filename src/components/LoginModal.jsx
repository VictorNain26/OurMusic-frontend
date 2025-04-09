import React, { useState, useEffect } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import ModalWrapper from './ui/ModalWrapper';
import { authClient } from '../lib/authClient.jsx';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const LoginModal = ({ isOpen, onRequestClose }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isResending, setIsResending] = useState(false);
  const { signIn } = authClient;
  const { refetch } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setForm({ email: '', password: '' });
      setIsResending(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn.email({
      email: form.email,
      password: form.password,
    });

    if (res.error) {
      toast.error(res.error.message || 'Erreur de connexion');
    } else {
      toast.success('Bienvenue 🎉 Connexion réussie !');
      onRequestClose();
      await refetch();
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2 className="text-2xl font-semibold mb-4 text-center">Se connecter</h2>

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
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          Se connecter
        </Button>
      </form>
    </ModalWrapper>
  );
};

export default LoginModal;
