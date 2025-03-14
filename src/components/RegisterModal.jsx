import React, { useState, useEffect } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import ModalWrapper from './ui/ModalWrapper';
import { useAuthStore } from '../store/authStore';

const RegisterModal = ({ isOpen, onRequestClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading } = useAuthStore();

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await register(username, email, password);
    if (user) onRequestClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2 className="text-2xl font-semibold mb-4">S'inscrire</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nom d'utilisateur</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mot de passe</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Création du compte..." : "S'inscrire"}
        </Button>
      </form>
    </ModalWrapper>
  );
};

export default RegisterModal;
