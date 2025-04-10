import React from 'react';
import { Link } from 'react-router-dom';
import ChromecastButton from './ChromecastButton';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { capitalizeFirstLetter } from '../utils/format';
import { usePlayerStore } from '../lib/playerService';

const Header = ({ onLogin, onRegister }) => {
  const { user, signOut } = useAuth();
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const renderAuthButtons = () => {
    if (user) {
      return (
        <>
          <span className="font-medium text-gray-700">
            {capitalizeFirstLetter(user.name || user.username || user.email)}
          </span>

          {user.role === 'admin' && (
            <>
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wide">
                Admin
              </span>
              <Link
                to="/admin/dashboard"
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded"
              >
                Dashboard
              </Link>
            </>
          )}

          <Button
            onClick={signOut}
            className="bg-red-500 hover:bg-red-600 text-white text-sm"
          >
            Déconnexion
          </Button>
        </>
      );
    }

    return (
      <>
        <Button
          onClick={onLogin}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm"
          data-login-button
        >
          Connexion
        </Button>
        <Button
          onClick={onRegister}
          className="bg-green-600 hover:bg-green-500 text-white text-sm"
        >
          Inscription
        </Button>
      </>
    );
  };

  return (
    <header className="w-full border-b p-4 flex flex-wrap justify-between items-center gap-4 bg-white shadow-sm z-10">
      <div className="text-xl font-bold text-gray-800">
        <Link to="/">OurMus</Link>
      </div>

      <div className="flex items-center flex-wrap gap-3">
        <span className="text-sm text-gray-600">
          {isPlaying ? '🎶 Radio en cours de lecture' : 'Radio arrêtée'}
        </span>

        {renderAuthButtons()}
        <ChromecastButton />
      </div>
    </header>
  );
};

export default Header;
