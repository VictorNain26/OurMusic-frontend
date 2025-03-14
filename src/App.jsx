import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ButtonRefreshSpotify from './components/ButtonRefreshSpotify';
import Layout from './layout/Layout';
import AuthGuard from './layout/AuthGuard';
import AdminGuard from './layout/AdminGuard';

function App() {
  return (
    <Routes>
      {/* 🏠 Page publique */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />

      {/* 🔐 Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminGuard>
            <Layout>
              <ButtonRefreshSpotify />
            </Layout>
          </AdminGuard>
        }
      />

      {/* 🚧 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
