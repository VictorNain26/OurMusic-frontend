import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ChromecastButton from './ChromecastButton';
import Button from './ui/Button';
import { motion } from 'framer-motion';

const Header = ({ onLogin, onRegister, onLogout }) => {
  const { user, authReady } = useAuthStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full border-b p-4 flex flex-wrap justify-between items-center gap-4 bg-white shadow-sm"
    >
      <div className="text-xl font-bold text-gray-800">
        <Link to="/">OurMusic</Link>
      </div>

      {authReady && (
        <div className="flex items-center flex-wrap gap-3">
          {user ? (
            <>
              <span className="font-medium text-gray-700">{user.username}</span>
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
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white text-sm"
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onLogin}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm"
                data-login-button
              >
                Login
              </Button>
              <Button
                onClick={onRegister}
                className="bg-green-600 hover:bg-green-500 text-white text-sm"
              >
                Register
              </Button>
            </>
          )}
          <ChromecastButton />
        </div>
      )}
    </motion.header>
  );
};

export default Header;

