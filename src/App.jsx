import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ButtonRefreshSpotify from './components/ButtonRefreshSpotify';
import Layout from './layout/Layout';
import AuthGuard from './layout/AuthGuard';
import AdminGuard from './layout/AdminGuard';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from './layout/PageWrapper';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Layout>
              <PageWrapper>
                <HomePage />
              </PageWrapper>
            </Layout>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminGuard>
              <Layout>
                <PageWrapper>
                  <ButtonRefreshSpotify />
                </PageWrapper>
              </Layout>
            </AdminGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
