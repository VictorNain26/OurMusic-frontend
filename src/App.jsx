import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ButtonRefreshSpotify from './components/ButtonRefreshSpotify';

function App() {
  return (
    <Routes>
      {/* Page d'accueil publique */}
      <Route path="/" element={<HomePage />} />

      {/* Route protégée pour accéder à spotify-refresh */}
        <Route path="/spotify-refresh" element={<ButtonRefreshSpotify />} />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
