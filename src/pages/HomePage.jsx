import React, { useState } from 'react';
import AzuracastPlayer from './../components/AzuracastPlayer';
import LoginModal from './../components/LoginModal';
import RegisterModal from './../components/RegisterModal';

const HomePage = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (token) => {
    // Optionally decode token to get user info or fetch user info from the backend
    // Here we simply set the token for demonstration
    setUser({ token });
  };

  const handleRegisterSuccess = (user) => {
    setUser(user);
  };

  return (
    <div>
      <button onClick={() => setLoginModalOpen(true)}>Login</button>
      <button onClick={() => setRegisterModalOpen(true)}>Register</button>
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onRequestClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onRequestClose={() => setRegisterModalOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
      {user && <p>Welcome, {user.username || 'User'}!</p>}
      <AzuracastPlayer />
    </div>
  );
};

export default HomePage;