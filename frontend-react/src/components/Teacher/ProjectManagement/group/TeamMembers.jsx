import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../../UI/LoadingSpinner';

const TeamMembers = ({ project, showDetails = false }) => {
  const [expandedGroup, setExpandedGroup] = useState(null);
  const navigate = useNavigate();

  if (!project || !project.groupes) {
    return (
      <div className="team-members-loading">
        <LoadingSpinner />
        <p>Chargement des équipes...</p>
      </div>
    );
  }

  const toggleGroup = (groupId) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  const getGroupProgress = (groupe) => {
    const totalTasks = groupe.taches?.length || 0;
    const completedTasks = groupe.taches?.filter(t => t.statut === 'TERMINEE').length || 0;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getMemberRole = (membre, groupe) => {
    // Logique pour déterminer le rôle (chef de groupe, membre, etc.)
    if (groupe.chefGroupe && groupe.chefGroupe.id === membre.id) {
      return 'Chef de groupe';
    }
    return 'Membre';
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'ACTIF': return 'var(--success)';
      case 'INACTIF': return 'var(--text-muted)';
      case 'EN_RETARD': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="team-members">
      <div className="team-header">
        <h3>Équipes du projet</h3>
        {project.groupes.length > 0 && (
          <span className="team-count">
            {project.groupes.length} groupe{project.groupes.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {project.groupes.length === 0 ? (
        <div className="empty-teams">
          <div className="empty-icon">
            <i className="fas fa-users"></i>
          </div>
          <h4>Aucune équipe assignée</h4>
          <p>Ce projet n'a pas encore d'équipes assignées.</p>
        </div>
      ) : (
        <div className="groups-list">
          {project.groupes.map((groupe) => (
            <div key={groupe.id} className="group-card">
              <div 
                className="group-header"
                onClick={() => showDetails && toggleGroup(groupe.id)}
              >
                <div className="group-info">
                  <div className="group-name-section">
                    <h4 className="group-name">{groupe.nom}</h4>
                    {groupe.chefGroupe && (
                      <span className="group-leader">
                        <i className="fas fa-crown"></i>
                        {groupe.chefGroupe.prenom} {groupe.chefGroupe.nom}
                      </span>
                    )}
                  </div>
                  
                </div>

                {showDetails && (
                  <div className="group-actions">
                    <button className="btn btn-icon">
                      <i className={`fas fa-chevron-${expandedGroup === groupe.id ? 'up' : 'down'}`}></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Barre de progression */}
              <div className="group-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getGroupProgress(groupe)}%`,
                      backgroundColor: getGroupProgress(groupe) === 100 ? 'var(--success)' : 'var(--primary)'
                    }}
                  ></div>
                </div>
                <span className="progress-text">{getGroupProgress(groupe)}%</span>
              </div>

              {/* Détails du groupe (expandable) */}
              {showDetails && expandedGroup === groupe.id && (
                <div className="group-details">
                  {/* Membres du groupe */}
                  <div className="members-section">
                    <h5>Membres de l'équipe</h5>
                    <div className="members-list">
                      {groupe.membres?.map((membre) => (
                        <div key={membre.id} className="member-item">
                          <div className="member-avatar">
                            {membre.avatar ? (
                              <img src={membre.avatar} alt={`${membre.prenom} ${membre.nom}`} />
                            ) : (
                              <div className="avatar-placeholder">
                                {membre.prenom.charAt(0)}{membre.nom.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="member-info">
                            <div className="member-name">
                              {membre.prenom} {membre.nom}
                            </div>
                            <div className="member-role">
                              {getMemberRole(membre, groupe)}
                            </div>
                            <div className="member-status">
                              <span 
                                className="status-dot"
                                style={{ backgroundColor: getStatusColor(membre.statut) }}
                              ></span>
                              {membre.statut || 'ACTIF'}
                            </div>
                          </div>
                          <div className="member-tasks">
                            <span className="task-count">
                              {groupe.taches?.filter(t => t.assignee?.id === membre.id).length || 0} tâches
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tâches du groupe */}
                  <div className="tasks-section">
                    <h5>Tâches de l'équipe</h5>
                    <div className="tasks-overview">
                      {groupe.taches?.slice(0, 5).map((tache) => (
                        <div key={tache.id} className="task-item">
                          <div className="task-info">
                            <span className="task-name">{tache.nom}</span>
                            <span className="task-assignee">
                              {tache.assignee ? `${tache.assignee.prenom} ${tache.assignee.nom}` : 'Non assignée'}
                            </span>
                          </div>
                          <div className={`task-status status-${tache.statut?.toLowerCase()}`}>
                            {tache.statut}
                          </div>
                        </div>
                      ))}
                      {groupe.taches && groupe.taches.length > 5 && (
                        <div className="more-tasks">
                          + {groupe.taches.length - 5} autres tâches...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="group-actions-section">
                    <button className="btn btn-sm btn-outline">
                      <i className="fas fa-envelope"></i>
                      Contacter l'équipe
                    </button>
                    <button className="btn btn-sm btn-outline">
                      <i className="fas fa-chart-bar"></i>
                      Voir détails
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vue compacte (pour l'onglet vue d'ensemble) */}
      {!showDetails && project.groupes.length > 0 && (
        <div className="teams-summary">
          <div className="summary-stats">
            <div className="summary-stat">
              <div className="stat-value">{project.groupes.length}</div>
              <div className="stat-label">Équipes</div>
            </div>
            <div className="summary-stat">
              <div className="stat-value">
                {project.groupes.reduce((total, groupe) => total + (groupe.membres?.length || 0), 0)}
              </div>
              <div className="stat-label">Étudiants</div>
            </div>
            <div className="summary-stat">
              <div className="stat-value">
                {project.groupes.reduce((total, groupe) => total + (groupe.taches?.length || 0), 0)}
              </div>
              <div className="stat-label">Tâches</div>
            </div>
          </div>

          <div className="quick-actions">
            <button
              className="btn btn-sm btn-text"
              onClick={() => navigate('/groups', { state: { fromProjectId: project.id } })}
            >
              <i className="fas fa-plus"></i>
              Ajouter une équipe
            </button>
            <button
              className="btn btn-sm btn-text"
              onClick={() => navigate('/groups')}
            >
              <i className="fas fa-users"></i>
              Gérer les équipes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;