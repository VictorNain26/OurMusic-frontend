import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import Input from './ui/Input';
import Button from './ui/Button';
import ModalWrapper from './ui/ModalWrapper';

const RegisterModal = ({ isOpen, onRequestClose, onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });
      if (onRegisterSuccess) onRegisterSuccess(data.user);
      onRequestClose();
    } catch (err) {
      console.error('Erreur lors de l’inscription :', err);
      setError('Une erreur est survenue lors de l’inscription. Veuillez réessayer.');
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2 className="text-2xl font-semibold mb-4">S'inscrire</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nom d'utilisateur</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mot de passe</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
          S'inscrire
        </Button>
      </form>
    </ModalWrapper>
  );
};

export default RegisterModal;
