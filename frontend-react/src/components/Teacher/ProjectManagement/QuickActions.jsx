import React from 'react';

const QuickActions = ({ onAction }) => {
  const actions = [
    {
      id: 'create-project',
      title: 'Nouveau Projet',
      description: 'Créer un nouveau projet',
      icon: 'fas fa-plus',
      color: 'primary',
      action: () => onAction('create-project')
    },
    {
      id: 'manage-groups',
      title: 'Gérer les Groupes',
      description: 'Organiser les groupes d\'étudiants',
      icon: 'fas fa-users',
      color: 'success',
      action: () => onAction('manage-groups')
    },
    {
      id: 'review-deliverables',
      title: 'Corriger les Livrables',
      description: 'Évaluer les travaux soumis',
      icon: 'fas fa-file-check',
      color: 'warning',
      action: () => onAction('review-deliverables')
    },
    {
      id: 'generate-reports',
      title: 'Rapports',
      description: 'Générer des rapports d\'avancement',
      icon: 'fas fa-chart-bar',
      color: 'info',
      action: () => onAction('generate-reports')
    }
  ];

  return (
    <div className="quick-actions-card">
      <div className="card-header">
        <h3>Actions Rapides</h3>
      </div>
      <div className="card-body">
        <div className="actions-grid">
          {actions.map(action => (
            <button
              key={action.id}
              className={`action-item action-${action.color}`}
              onClick={action.action}
            >
              <div className="action-icon">
                <i className={action.icon}></i>
              </div>
              <div className="action-content">
                <div className="action-title">{action.title}</div>
                <div className="action-description">{action.description}</div>
              </div>
              <div className="action-arrow">
                <i className="fas fa-chevron-right"></i>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;