import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Lors d'une connexion réussie (user présent), afficher le loader plein écran avec citations
    if (user) {
      return <LoadingSpinner fullScreen showQuote />;
    }
    // Autres chargements publics: spinner simple
    return <LoadingSpinner size="medium" />;
  }

  // Liste des routes accessibles même quand connecté
  const allowedRoutesWhenAuthenticated = ['/reset-password', '/forgot-password', '/verify-email'];
  
  if (user && !allowedRoutesWhenAuthenticated.includes(location.pathname)) {
    const redirectTo = '/teacher-dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PublicRoute;