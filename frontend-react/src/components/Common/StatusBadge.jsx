import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      // Statuts projet
      PLANIFIE: { label: 'Planifié', color: 'primary', icon: 'fas fa-clock' },
      EN_COURS: { label: 'En cours', color: 'primary', icon: 'fas fa-play-circle' },
      TERMINE: { label: 'Terminé', color: 'success', icon: 'fas fa-check-circle' },
      ANNULE: { label: 'Annulé', color: 'danger', icon: 'fas fa-times-circle' },

      // Statuts tâche
      A_FAIRE: { label: 'À faire', color: 'gray', icon: 'fas fa-circle' },
      EN_COURS_TACHE: { label: 'En cours', color: 'primary', icon: 'fas fa-spinner' },
      TERMINEE: { label: 'Terminée', color: 'success', icon: 'fas fa-check' },
      EN_RETARD: { label: 'En retard', color: 'danger', icon: 'fas fa-exclamation-triangle' },

      // Statuts livrable
      A_SOUMETTRE: { label: 'À soumettre', color: 'gray', icon: 'fas fa-upload' },
      SOUMIS: { label: 'Soumis', color: 'primary', icon: 'fas fa-check' },
      EN_CORRECTION: { label: 'En correction', color: 'warning', icon: 'fas fa-edit' },
      CORRIGE: { label: 'Corrigé', color: 'success', icon: 'fas fa-check-double' },
      REJETE: { label: 'Rejeté', color: 'danger', icon: 'fas fa-times' }
    };

    const cleanedStatus = typeof status === 'string' ? status.trim().toUpperCase() : status;
    const config = configs[cleanedStatus];

    if (config) return config;

    return { label: status, color: 'gray', icon: 'fas fa-circle' };
  };

  const config = getStatusConfig(status);

  return (
    <span className={`status-badge status-${config.color} size-${size}`}>
      <i className={config.icon}></i>
      {config.label}
    </span>
  );
};

export default StatusBadge;