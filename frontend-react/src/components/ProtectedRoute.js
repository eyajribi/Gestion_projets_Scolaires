import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    // Après connexion réussie (user défini), afficher le loader plein écran avec citations
    if (user) {
      return <LoadingSpinner fullScreen showQuote />;
    }
    // Chargements généraux: spinner simple
    return <LoadingSpinner size="medium" />;
  }

  if (!isAuthenticated || !user) {
    // Rediriger vers login avec l'URL de retour
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification du rôle si spécifié
  if (requiredRole && user.role !== requiredRole) {
    // Rediriger vers le dashboard approprié selon le rôle
    let redirectTo = '/unauthorized';
    if (user.role === 'ENSEIGNANT') redirectTo = '/teacher-dashboard';
    else if (user.role === 'ADMIN') redirectTo = '/admin/dashboard';
    else if (user.role === 'ETUDIANT') redirectTo = '/student-app';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;