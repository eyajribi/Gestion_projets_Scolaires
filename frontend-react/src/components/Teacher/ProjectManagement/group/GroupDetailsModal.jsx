import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../UI/LoadingSpinner';
import StudentSelector from './StudentSelector';

const GroupDetailsModal = ({ 
  group, 
  isOpen, 
  onClose, 
  onEdit,
  onAddStudent,
  onRemoveStudent,
  onCalculateProgress,
  allStudents = []
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  // Réinitialiser l'onglet actif quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  if (!isOpen || !group) {
    return null;
  }

  const {
    id,
    nom,
    description,
    etudiants = [],
    projets = [],
    pourcentageAvancement = 0,
    dateCreation,
    dateModification,
    statut
  } = group;

  // Capacité maximale du groupe (par défaut 5 si non défini)
  const maxGroupSize = group.capacite || 5;
  // Étudiants disponibles pour l'ajout
  const availableStudents = allStudents.filter(student => 
    !etudiants.some(etudiant => etudiant.id === student.id)
  );
  // Places restantes
  const placesRestantes = maxGroupSize - etudiants.length;

  // Gestion de l'ajout d'étudiant
  const handleAddStudent = async (studentId) => {
    setStudentsLoading(true);
    try {
      await onAddStudent(id, studentId);
      setShowStudentSelector(false);
    } catch (error) {
      console.error('Erreur ajout étudiant:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Gestion du retrait d'étudiant
  const handleRemoveStudent = async (studentId) => {
    setStudentsLoading(true);
    try {
      await onRemoveStudent(id, studentId);
    } catch (error) {
      console.error('Erreur retrait étudiant:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Gestion du calcul de progression
  const handleCalculateProgress = async () => {
    setProgressLoading(true);
    try {
      await onCalculateProgress(id);
    } catch (error) {
      console.error('Erreur calcul progression:', error);
    } finally {
      setProgressLoading(false);
    }
  };

  // Formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Couleur de la progression
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'var(--success-dark)';
    if (progress >= 50) return 'var(--warning-dark)';
    return 'var(--danger-dark)';
  };

  // Statut du groupe
  const getStatusInfo = (status) => {
    switch (status) {
      case 'ACTIF':
        return { label: 'Actif', color: 'var(--success-dark)', bgColor: 'var(--success-light)' };
      case 'INACTIF':
        return { label: 'Inactif', color: 'var(--text-secondary)', bgColor: 'var(--bg-secondary)' };
      case 'ARCHIVE':
        return { label: 'Archivé', color: 'var(--warning-dark)', bgColor: 'var(--warning-light)' };
      default:
        return { label: 'Inconnu', color: 'var(--text-secondary)', bgColor: 'var(--bg-secondary)' };
    }
  };

  const statusInfo = getStatusInfo(statut);

  return (
    <div className="modal-overlay">
      <div className="modal-container large">
        {/* En-tête du modal */}
        <div className="modal-header">
          <div className="header-content">
            <h2>Détails du groupe</h2>
            <p>Informations complètes sur le groupe et ses membres</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => onEdit(group)}
              title="Modifier le groupe"
            >
              <i className="fas fa-edit"></i>
              Modifier
            </button>
            <button
              className="btn btn-icon btn-close"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Informations principales */}
        <div className="group-header-section">
          <div className="group-basic-info">
            <h1 className="group-title">{nom}</h1>
            {description && (
              <p className="group-description">{description}</p>
            )}
            <div className="group-meta-info">
              <div className="meta-item">
                <i className="fas fa-calendar"></i>
                <span>Créé le {formatDate(dateCreation)}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-users"></i>
                <span>{etudiants.length} étudiant{etudiants.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-project-diagram"></i>
                <span>{projets.length} projet{projets.length !== 1 ? 's' : ''}</span>
              </div>
              <div 
                className="status-badge"
                style={{ 
                  color: statusInfo.color, 
                  backgroundColor: statusInfo.bgColor 
                }}
              >
                {statusInfo.label}
              </div>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="group-stats-cards">
            <div className="stat-card">
              <div className="stat-value">{pourcentageAvancement}%</div>
              <div className="stat-label">Progression</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${pourcentageAvancement}%`,
                    backgroundColor: getProgressColor(pourcentageAvancement)
                  }}
                ></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{etudiants.length}</div>
              <div className="stat-label">Membres</div>
              <div className="stat-trend">
                <i className="fas fa-user-check"></i>
                Actifs
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{projets.length}</div>
              <div className="stat-label">Projets</div>
              <div className="stat-trend">
                <i className="fas fa-tasks"></i>
                En cours
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-chart-pie"></i>
            Aperçu
          </button>
          <button
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <i className="fas fa-user-graduate"></i>
            Étudiants ({etudiants.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <i className="fas fa-project-diagram"></i>
            Projets ({projets.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <i className="fas fa-history"></i>
            Activité
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="modal-content">
          
          {/* Onglet Aperçu */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="overview-grid">
                {/* Progression détaillée */}
                <div className="overview-card">
                  <h3>Progression du groupe</h3>
                  <div className="progress-details">
                    <div className="progress-main">
                      <div className="progress-value">{pourcentageAvancement}%</div>
                      <div className="progress-bar-large">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${pourcentageAvancement}%`,
                            backgroundColor: getProgressColor(pourcentageAvancement)
                          }}
                        ></div>
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleCalculateProgress}
                      disabled={progressLoading}
                    >
                      {progressLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <i className="fas fa-calculator"></i>
                      )}
                      Recalculer l'avancement
                    </button>
                  </div>
                </div>

                {/* Dernière activité */}
                <div className="overview-card">
                  <h3>Dernière activité</h3>
                  <div className="activity-list">
                    {dateModification ? (
                      <div className="activity-item">
                        <div className="activity-icon">
                          <i className="fas fa-edit"></i>
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">
                            Groupe modifié
                          </div>
                          <div className="activity-date">
                            {formatDate(dateModification)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="activity-item">
                        <div className="activity-icon">
                          <i className="fas fa-plus"></i>
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">
                            Groupe créé
                          </div>
                          <div className="activity-date">
                            {formatDate(dateCreation)}
                          </div>
                        </div>
                      </div>
                    )}
                    {etudiants.length > 0 && (
                      <div className="activity-item">
                        <div className="activity-icon">
                          <i className="fas fa-user-plus"></i>
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">
                            {etudiants.length} membre{etudiants.length !== 1 ? 's' : ''} dans le groupe
                          </div>
                          <div className="activity-date">
                            Dernier ajout récent
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Projets récents */}
                {projets.length > 0 && (
                  <div className="overview-card">
                    <h3>Projets récents</h3>
                    <div className="projects-preview">
                      {projets.slice(0, 3).map(projet => (
                        <div key={projet.id} className="project-preview-item">
                          <div className="project-icon">
                            <i className="fas fa-folder"></i>
                          </div>
                          <div className="project-info">
                            <div className="project-name">{projet.nom}</div>
                            <div className="project-status">
                              {projet.statut || 'En cours'}
                            </div>
                          </div>
                        </div>
                      ))}
                      {projets.length > 3 && (
                        <div className="more-projects">
                          +{projets.length - 3} autre{projets.length - 3 !== 1 ? 's' : ''} projet{projets.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations système */}
                <div className="overview-card">
                  <h3>Informations système</h3>
                  <div className="system-info">
                    <div className="info-row">
                      <span className="info-label">ID du groupe:</span>
                      <span className="info-value">{id}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date de création:</span>
                      <span className="info-value">{formatDate(dateCreation)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Dernière modification:</span>
                      <span className="info-value">
                        {dateModification ? formatDate(dateModification) : 'Aucune modification'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Statut:</span>
                      <span 
                        className="info-value status"
                        style={{ color: statusInfo.color }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Étudiants */}
          {activeTab === 'students' && (
            <div className="tab-content">
              <div className="students-header">
                <div className="header-info">
                  <h3>Membres du groupe</h3>
                  <p>
                    {etudiants.length} étudiant{etudiants.length !== 1 ? 's' : ''} dans ce groupe · 
                    {availableStudents.length} étudiant{availableStudents.length !== 1 ? 's' : ''} disponible{availableStudents.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowStudentSelector(true)}
                  disabled={studentsLoading || availableStudents.length === 0 || placesRestantes <= 0}
                  title={placesRestantes <= 0 ? "Capacité maximale atteinte" : "Ajouter un étudiant"}
                >
                  <i className="fas fa-user-plus"></i>
                  Ajouter un étudiant
                </button>
              </div>

              <div className="students-grid">
                {etudiants.length > 0 ? (
                  etudiants.map(etudiant => (
                    <div key={etudiant.id} className="student-profile-card">
                      <div className="student-avatar-large">
                        {etudiant.prenom?.[0]}{etudiant.nom?.[0]}
                      </div>
                      <div className="student-info">
                        <h4 className="student-name">
                          {etudiant.prenom} {etudiant.nom}
                        </h4>
                        <p className="student-email">{etudiant.email}</p>
                        <div className="student-meta">
                          <span className="meta-item">
                            <i className="fas fa-id-card"></i>
                            {etudiant.matricule || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="student-actions">
                        <button
                          className="btn btn-icon btn-danger"
                          onClick={() => handleRemoveStudent(etudiant.id)}
                          disabled={studentsLoading}
                          title="Retirer du groupe"
                        >
                          <i className="fas fa-user-minus"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <i className="fas fa-user-graduate"></i>
                    </div>
                    <h4>Aucun étudiant dans ce groupe</h4>
                    <p>Ajoutez des étudiants pour commencer à travailler sur des projets</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowStudentSelector(true)}
                    >
                      <i className="fas fa-user-plus"></i>
                      Ajouter le premier étudiant
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Projets */}
          {activeTab === 'projects' && (
            <div className="tab-content">
              <div className="projects-header">
                <h3>Projets du groupe</h3>
                <p>Projets sur lesquels ce groupe travaille actuellement</p>
              </div>

              <div className="projects-list">
                {projets.length > 0 ? (
                  projets.map(projet => (
                    <div key={projet.id} className="project-card">
                      <div className="project-header">
                        <h4 className="project-title">{projet.nom}</h4>
                        <span className={`project-status ${projet.statut?.toLowerCase() || 'inconnu'}`}>
                          {projet.statut || 'Statut inconnu'}
                        </span>
                      </div>
                      {projet.description && (
                        <p className="project-description">{projet.description}</p>
                      )}
                      <div className="project-meta">
                        <span className="meta-item">
                          <i className="fas fa-calendar"></i>
                          Début: {projet.dateDebut ? new Date(projet.dateDebut).toLocaleDateString('fr-FR') : 'Non définie'}
                        </span>
                        <span className="meta-item">
                          <i className="fas fa-flag"></i>
                          Échéance: {projet.dateEcheance ? new Date(projet.dateEcheance).toLocaleDateString('fr-FR') : 'Non définie'}
                        </span>
                      </div>
                      <div className="project-actions">
                        <button className="btn btn-text">
                          <i className="fas fa-external-link-alt"></i>
                          Voir le projet
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <i className="fas fa-project-diagram"></i>
                    </div>
                    <h4>Aucun projet associé</h4>
                    <p>Ce groupe ne travaille sur aucun projet pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Activité */}
          {activeTab === 'activity' && (
            <div className="tab-content">
              <div className="activity-header">
                <h3>Historique d'activité</h3>
                <p>Historique complet des modifications du groupe</p>
              </div>

              <div className="activity-timeline">
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Groupe créé</div>
                    <div className="timeline-date">{formatDate(dateCreation)}</div>
                    <div className="timeline-description">
                      Le groupe a été créé avec le nom "{nom}"
                    </div>
                  </div>
                </div>

                {dateModification && (
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Groupe modifié</div>
                      <div className="timeline-date">{formatDate(dateModification)}</div>
                      <div className="timeline-description">
                        Dernière modification des informations du groupe
                      </div>
                    </div>
                  </div>
                )}

                {etudiants.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Étudiants ajoutés</div>
                      <div className="timeline-date">Récemment</div>
                      <div className="timeline-description">
                        {etudiants.length} étudiant{etudiants.length !== 1 ? 's' : ''} ajouté{etudiants.length !== 1 ? 's' : ''} au groupe
                      </div>
                    </div>
                  </div>
                )}

                {projets.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Projets assignés</div>
                      <div className="timeline-date">Récemment</div>
                      <div className="timeline-description">
                        {projets.length} projet{projets.length !== 1 ? 's' : ''} assigné{projets.length !== 1 ? 's' : ''} au groupe
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal d'ajout d'étudiant */}
        {showStudentSelector && (
          <StudentSelector
            students={availableStudents}
            onSelect={handleAddStudent}
            onClose={() => setShowStudentSelector(false)}
            title="Ajouter un étudiant au groupe"
            loading={studentsLoading}
            maxSelection={placesRestantes}
          />
        )}

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-container {
            background: var(--card-bg);
            border-radius: 16px;
            box-shadow: var(--shadow-lg);
            width: 100%;
            max-width: 1000px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            color: var(--text-primary);
          }

          .modal-container.large {
            max-width: 1000px;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
          }

          .header-content h2 {
            margin: 0 0 4px 0;
            color: var(--text-primary);
            font-size: 1.25rem;
            font-weight: 600;
          }

          .header-content p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
          }

          .header-actions {
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .group-header-section {
            padding: 1.25rem 1.5rem 1rem;
            border-bottom: 1px solid var(--border-color);
            background: var(--card-bg);
          }

          .group-basic-info {
            margin-bottom: 1rem;
          }

          .group-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 0.5rem 0;
          }

          .group-description {
            font-size: 0.9rem;
            color: var(--text-secondary);
            line-height: 1.4;
            margin: 0 0 0.75rem 0;
            white-space: pre-line;
          }

          .group-meta-info {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-secondary);
            font-size: 0.85rem;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
          }

          .group-stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 0.75rem;
            margin-top: 0.75rem;
          }

          .stat-card {
            background: var(--card-bg);
            padding: 0.75rem 0.65rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            text-align: center;
          }

          .stat-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 4px;
            text-transform: uppercase;
          }

          .stat-trend {
            font-size: 0.8rem;
            color: #10b981;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }

          .progress-bar {
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 0.3s ease;
          }

          .modal-tabs {
            display: flex;
            padding: 0 1.5rem;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
          }

          .tab-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0.9rem 1.1rem;
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 0.85rem;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
          }

          .tab-button:hover {
            color: var(--text-primary);
            background: var(--card-bg);
          }

          .tab-button.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
            background: var(--card-bg);
          }

          .modal-content {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
          }

          .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
          }

          .overview-card {
            background: var(--card-bg);
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
          }

          .overview-card h3 {
            margin: 0 0 0.75rem 0;
            color: var(--text-primary);
            font-size: 0.95rem;
          }

          .progress-details {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .progress-main {
            text-align: left;
          }

          .progress-value {
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 0.75rem;
          }

          .progress-bar-large {
            height: 8px;
            background: var(--border-color);
            border-radius: var(--radius-md);
            overflow: hidden;
          }

          .activity-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .activity-item {
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }

          .activity-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--bg-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            flex-shrink: 0;
          }

          .activity-title {
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 4px;
          }

          .activity-date {
            font-size: 0.8rem;
            color: var(--text-secondary);
          }

          .projects-preview {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .project-preview-item {
            display: flex;
            gap: 12px;
            align-items: center;
            padding: 12px;
            background: var(--card-bg);
            border-radius: var(--radius-md);
          }

          .project-icon {
            color: #3b82f6;
          }

          .project-name {
            font-weight: 500;
            color: var(--text-primary);
          }

          .project-status {
            font-size: 0.8rem;
            color: var(--text-secondary);
          }

          .more-projects {
            text-align: center;
            padding: 12px;
            color: var(--text-secondary);
            font-size: 0.9rem;
          }

          .system-info {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .info-label {
            color: #6b7280;
            font-size: 0.9rem;
          }

          .info-value {
            color: #1f2937;
            font-weight: 500;
            font-size: 0.9rem;
          }

          .info-value.status {
            font-weight: 600;
          }

          .students-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border-color);
          }

          .students-grid {
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            margin-top: 0.5rem;
          }

          .student-profile-card {
            display: flex;
            align-items: center;
            gap: 1.1rem;
            padding: 0.85rem 1.1rem;
            background: var(--bg-secondary);
            border-radius: 10px;
            border: 1px solid var(--border-color);
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
            transition: background 0.2s;
            position: relative;
          }
          .student-profile-card:nth-child(even) {
            background: var(--card-bg);
          }
          }

          .student-profile-card:hover {
            background: var(--primary-bg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          }

          .student-avatar-large {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: var(--info-dark);
            color: var(--white);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.1rem;
            flex-shrink: 0;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          }

          .student-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 0;
          }

          .student-name {
            margin: 0;
            color: var(--primary-dark);
            font-size: 1.08rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            display: inline;
          }

          .student-email {
            margin-left: 10px;
            color: var(--text-secondary);
            font-size: 0.93rem;
            display: inline;
            font-weight: 400;
          }

          .student-meta {
            display: flex;
            gap: 10px;
            margin-top: 4px;
          }

          .meta-item {
            font-size: 0.82rem;
            color: var(--primary-dark);
            background: var(--primary-bg);
            border-radius: 6px;
            padding: 2px 9px;
            font-weight: 500;
            border: 1px solid var(--border-color);
          }

          .student-actions {
            display: flex;
            align-items: flex-start;
          }

          .projects-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .project-card {
            padding: 1rem 0.9rem;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 10px;
          }

          .project-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
          }

          .project-title {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.05rem;
          }

          .project-status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
          }

          .project-status.actif {
            background: var(--success-light);
            color: var(--success-dark);
          }

          .project-status.terminé {
            background: var(--info-light);
            color: var(--info-dark);
          }

          .project-description {
            margin: 0 0 0.75rem 0;
            color: var(--text-secondary);
            line-height: 1.4;
          }

          .project-meta {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
          }

          .project-actions {
            display: flex;
            justify-content: flex-end;
          }

          .activity-timeline {
            position: relative;
            padding-left: 20px;
          }

          .timeline-item {
            position: relative;
            padding-bottom: 32px;
          }

          .timeline-marker {
            position: absolute;
            left: -20px;
            top: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #3b82f6;
            border: 2px solid white;
            box-shadow: 0 0 0 3px #3b82f6;
          }

          .timeline-content {
            background: var(--card-bg);
            padding: 0.9rem 0.85rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
          }

          .timeline-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
          }

          .timeline-date {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-bottom: 8px;
          }

          .timeline-description {
            color: var(--text-secondary);
            font-size: 0.9rem;
            line-height: 1.4;
          }

          .empty-state {
            text-align: center;
            padding: 2.5rem 1.25rem;
            color: var(--text-secondary);
          }

          .empty-icon {
            font-size: 2.5rem;
            margin-bottom: 0.9rem;
            color: var(--text-muted);
          }

          .empty-state h4 {
            margin: 0 0 8px 0;
            color: var(--text-primary);
          }

          .empty-state p {
            margin: 0 0 1.25rem 0;
            font-size: 0.9rem;
          }

          @media (max-width: 768px) {
            .modal-container {
              margin: 0;
              max-height: 100vh;
              border-radius: 0;
            }

            .modal-header {
              flex-direction: column;
              gap: 16px;
            }

            .header-actions {
              align-self: stretch;
              justify-content: space-between;
            }

            .group-header-section {
              padding: 20px;
            }

            .group-title {
              font-size: 1.5rem;
            }

            .group-meta-info {
              flex-direction: column;
              gap: 12px;
            }

            .group-stats-cards {
              grid-template-columns: 1fr;
            }

            .modal-tabs {
              overflow-x: auto;
            }

            .modal-content {
              padding: 20px;
            }

            .overview-grid {
              grid-template-columns: 1fr;
            }

            .students-header {
              flex-direction: column;
              gap: 16px;
            }

            .students-grid {
              grid-template-columns: 1fr;
            }

            .project-header {
              flex-direction: column;
              gap: 12px;
              align-items: flex-start;
            }

            .project-meta {
              flex-direction: column;
              gap: 8px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GroupDetailsModal;