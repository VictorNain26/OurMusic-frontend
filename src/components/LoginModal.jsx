// src/components/LoginModal.jsx
import React, { useState } from 'react';
import Modal from 'react-modal';
import { useAuth0 } from '@auth0/auth0-react';

const LoginModal = ({ isOpen, onRequestClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithRedirect({
        redirectUri: window.location.origin,
        login_hint: email,
        password
      });
      onRequestClose();
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Login Modal">
      <h2>Se connecter</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Mot de passe:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Se connecter</button>
      </form>
      <button onClick={onRequestClose}>Fermer</button>
    </Modal>
  );
};

export default LoginModal;