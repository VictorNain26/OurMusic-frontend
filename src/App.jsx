// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './layout/Layout';
import AdminGuard from './layout/AdminGuard';

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <AnimatePresence mode="wait">
              <Layout>
                <HomePage />
              </Layout>
            </AnimatePresence>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminGuard>
              <AnimatePresence mode="wait">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AnimatePresence>
            </AdminGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
