import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>Accès non autorisé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <div className="error-actions">
            {/* Bouton retour supprimé */}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;