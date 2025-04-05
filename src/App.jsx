import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

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
            <Layout>
              <Suspense fallback={<div className="text-center py-10">Chargement...</div>}>
                <HomePage />
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminGuard>
              <Layout>
                <Suspense fallback={<div className="text-center py-10">Chargement admin...</div>}>
                  <AdminDashboard />
                </Suspense>
              </Layout>
            </AdminGuard>
          }
        />
        <Route
          path="/verify-email"
          element={
            <Suspense fallback={<div className="text-center py-10">Vérification de l’email...</div>}>
              <VerifyEmailPage />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<div className="text-center py-10">Chargement formulaire…</div>}>
              <ResetPasswordPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
