import React from 'react';
import Button from './ui/Button';
import { Link } from 'react-router-dom';
import ChromecastButton from './ChromecastButton';

const Header = ({ userInfo, onLogin, onRegister, onLogout }) => {
  return (
    <header className="flex flex-wrap justify-between items-center p-4 border-b gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        {userInfo ? (
          <>
            <span className="font-semibold text-lg">{userInfo.username}</span>
            {userInfo.role === 'admin' && (
              <>
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wide">
                  Admin
                </span>
                <Link
                  to="/admin/dashboard"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Dashboard
                </Link>
              </>
            )}
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={onLogout}>
              Déconnexion
            </Button>
          </>
        ) : (
          <>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={onLogin}>
              Login
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={onRegister}>
              Register
            </Button>
          </>
        )}
      </div>
      <ChromecastButton />
    </header>
  );
};

export default Header;
