import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ButtonRefreshSpotify from './components/ButtonRefreshSpotify';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Routes>
      {/* Page d'accueil publique */}
      <Route path="/" element={<HomePage />} />

      {/* Routes publiques pour login et register */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Route protégée pour accéder à spotify-refresh */}
      <Route element={<ProtectedRoute />}>
        <Route path="/spotify-refresh" element={<ButtonRefreshSpotify />} />
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
