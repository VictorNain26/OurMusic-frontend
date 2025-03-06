// src/components/PublicRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Hypothétique hook d'authentification

const PublicRoute = () => {
  const { isAuthenticated } = useAuth(); // Utilisez votre logique d'authentification ici

  if (window.location.pathname.includes('/spotify-refresh') && !isAuthenticated) {
    // Si l'utilisateur n'est pas authentifié et tente d'accéder à Spotify Refresh
    return <Navigate to="/login" />;
  }

  // Pour toutes les autres routes publiques, si l'utilisateur est authentifié, redirigez-le vers la page d'accueil
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Si l'utilisateur n'est pas authentifié, affichez le contenu public (Outlet)
  return <Outlet />;
};

export default PublicRoute;