import React from 'react';
import './ActivityFeed.css';

const ActivityFeed = ({ activities = [], onShowAll, onRefresh, showAll }) => {
  // Données par défaut si aucune activité n'est fournie
  const defaultActivities = [
    {
      id: 1,
      type: 'deliverable_submitted',
      message: 'Nouveau livrable soumis pour le projet "Application Mobile"',
      time: 'Il y a 2 heures',
      user: 'Eya Gharbi',
      project: 'Application Mobile',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'task_completed',
      message: 'Tâche "Conception base de données" marquée comme terminée',
      time: 'Il y a 5 heures',
      user: 'Ahmed Ben Salah',
      project: 'Site E-commerce',
      priority: 'low'
    },
    {
      id: 3,
      type: 'project_updated',
      message: 'Projet "Système Expert" mis à jour',
      time: 'Il y a 1 jour',
      user: 'Vous',
      project: 'Système Expert',
      priority: 'low'
    },
    {
      id: 4,
      type: 'comment_added',
      message: 'Nouveau commentaire sur le livrable "Rapport Final"',
      time: 'Il y a 1 jour',
      user: 'Mohamed Ali',
      project: 'Application Mobile',
      priority: 'medium'
    },
    {
      id: 5,
      type: 'deliverable_evaluated',
      message: 'Livrable "Code Source" évalué avec 16/20',
      time: 'Il y a 2 jours',
      user: 'Vous',
      project: 'Site E-commerce',
      priority: 'high'
    }
  ];

  const activitiesToShow = activities.length > 0 ? activities : defaultActivities;

  const getActivityIcon = (type) => {
    const icons = {
      deliverable_submitted: 'fas fa-file-upload',
      task_completed: 'fas fa-check-circle',
      project_updated: 'fas fa-edit',
      comment_added: 'fas fa-comment',
      deliverable_evaluated: 'fas fa-graduation-cap',
      task_created: 'fas fa-plus-circle',
      project_created: 'fas fa-project-diagram',
      default: 'fas fa-circle'
    };
    return icons[type] || icons.default;
  };

  const getActivityColor = (type) => {
    const colors = {
      deliverable_submitted: 'var(--info)',
      task_completed: 'var(--success)',
      project_updated: 'var(--primary)',
      comment_added: 'var(--warning)',
      deliverable_evaluated: 'var(--accent)',
      task_created: 'var(--success)',
      project_created: 'var(--primary)',
      default: 'var(--text-muted)'
    };
    return colors[type] || colors.default;
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { label: 'Important', color: 'danger' },
      medium: { label: 'Normal', color: 'warning' },
      low: { label: 'Faible', color: 'success' }
    };
    return config[priority] || config.medium;
  };

  const formatTime = (timeString) => {
    return timeString; // Pour l'instant, on retourne tel quel
  };

  return (
    <div className="activity-feed">
      <div className="activity-header">
        <h3>
          <i className="fas fa-stream"></i>
          Activité Récente
        </h3>
        {onShowAll && !showAll && (
          <button className="btn btn-text btn-sm" onClick={onShowAll}>
            Voir tout
          </button>
        )}
      </div>

      <div className="activity-list">
        {activitiesToShow.map((activity) => {
          const priorityConfig = getPriorityBadge(activity.priority);
          
          return (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon" style={{ color: getActivityColor(activity.type) }}>
                <i className={getActivityIcon(activity.type)}></i>
              </div>
              
              <div className="activity-content">
                <div className="activity-message">
                  {activity.message}
                </div>
                
                <div className="activity-meta">
                  <span className="activity-user">
                    <i className="fas fa-user"></i>
                    {activity.user}
                  </span>
                  
                  {activity.project && (
                    <span className="activity-project">
                      <i className="fas fa-project-diagram"></i>
                      {activity.project}
                    </span>
                  )}
                  
                  <span className="activity-time">
                    <i className="fas fa-clock"></i>
                    {formatTime(activity.time)}
                  </span>
                </div>
              </div>

              <div className="activity-actions">
                <span className={`priority-badge priority-${priorityConfig.color}`}>
                  {priorityConfig.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {activitiesToShow.length === 0 && (
        <div className="activity-empty">
          <i className="fas fa-inbox"></i>
          <p>Aucune activité récente</p>
        </div>
      )}

      <div className="activity-footer">
        {onRefresh && (
          <button className="btn btn-text btn-sm full-width" onClick={onRefresh}>
            <i className="fas fa-sync-alt"></i>
            Actualiser les activités
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;