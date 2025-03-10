// src/components/LoginModal.jsx
import React, { useState } from 'react';
import Modal from 'react-modal';
import { apiFetch } from '../utils/api';

const LoginModal = ({ isOpen, onRequestClose, onLoginSuccess }) => {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      console.log('Connexion réussie :', data);
      if (onLoginSuccess) onLoginSuccess(data);
      onRequestClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      // On réduit l'opacité et on ajoute un flou
      overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
      // On peut laisser 'className' gérer le contenu du modal
      className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4"
      shouldCloseOnOverlayClick={true}
    >
      <h2 className="text-2xl font-semibold mb-4">Se connecter</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Se connecter
        </button>
      </form>
    </Modal>
  );
};

export default LoginModal;
