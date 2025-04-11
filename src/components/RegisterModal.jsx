import React, { useState, useEffect } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import ModalWrapper from './ui/ModalWrapper';
import { authClient, sendVerificationEmail } from '../lib/authClient.jsx';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const RegisterModal = ({ isOpen, onRequestClose }) => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const { signUp } = authClient;
  const { refetch } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setForm({ username: '', email: '', password: '' });
      setSuccessMsg('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signUp.email({
      email: form.email,
      password: form.password,
      name: form.username,
    });

    if (res.error) {
      toast.error(res.error.message || 'Erreur à l’inscription');
    } else {
      setSuccessMsg("✅ Compte créé ! Vérifiez votre email.");
      toast.success('🎉 Compte créé avec succès ! Vérifiez votre email.');
      onRequestClose();
      await refetch();

      toast.error(
        (t) => (
          <span className="flex items-center">
            ⚠️ Vérifiez votre email !
            <Button
              onClick={async () => {
                await sendVerificationEmail({email: form.email, callbackURL: "/"});
                toast.dismiss(t.id);
              }}
              className="ml-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1"
            >
              Renvoyer
            </Button>
          </span>
        ),
        { duration: 7000 }
      );
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2 className="text-2xl font-semibold mb-4 text-center">Créer un compte</h2>

      {successMsg && (
        <p className="text-green-600 mb-3 text-sm text-center">{successMsg}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nom d'utilisateur</label>
          <Input
            name="username"
            placeholder="Nom d'utilisateur"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

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
          S'inscrire
        </Button>
      </form>
    </ModalWrapper>
  );
};

export default RegisterModal;
