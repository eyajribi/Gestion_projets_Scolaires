import React, { useState } from 'react';
import StudentSelector from './StudentSelector';
import ConfirmationModal from '../../../Common/ConfirmationModal';

const GroupCard = ({ 
  group, 
  allStudents, 
  viewMode,
  fromProjectId,
  onEdit, 
  onDelete, 
  onAddStudent, 
  onRemoveStudent,
  onViewDetails,
  onRestore,
  groupScope // 'active' ou 'archived', passé par le parent
}) => {
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const {
    id,
    nom,
    description,
    etudiants = [],
    projets = [],
    pourcentageAvancement = 0
  } = group;

  // Filtrer les étudiants disponibles pour l'ajout
  const availableStudents = allStudents.filter(student =>
    !etudiants.some(etudiant => etudiant.id === student.id)
  );

  // Gestion de l'ajout d'un étudiant
  const handleAddStudent = async (studentId) => {
    setIsProcessing(true);
    try {
      await onAddStudent(id, studentId);
      setShowStudentSelector(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'étudiant:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Gestion du retrait d'un étudiant
  const handleRemoveStudent = async (studentId) => {
    const studentName = etudiants.find(e => e.id === studentId)?.prenom || 'cet étudiant';
    
    if (!window.confirm(`Êtes-vous sûr de vouloir retirer ${studentName} du groupe ?`)) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await onRemoveStudent(id, studentId);
    } catch (error) {
      console.error('Erreur lors du retrait de l\'étudiant:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLinkToProject = async () => {
    if (!fromProjectId) return;
    setIsLinkModalOpen(true);
  };
  // Déterminer la couleur de la barre de progression
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'danger';
  };

  // Formater la date de création
  const formatCreationDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="item-card group-card"
    onClick={(e) => {
        if (!e.target.closest('.group-actions-menu') && 
            !e.target.closest('.add-button') && 
            !e.target.closest('.remove-button')) {
          onViewDetails();
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* En-tête du groupe */}
      <div className="group-header">
        <div className="group-main-info">
          <h3 className="group-name">{nom}</h3>
        </div>
        
        {/* Menu d'actions */}
        <div className="group-actions-menu">
          <div className="dropdown">
            <button 
              className="btn-icon dropdown-trigger"
              onClick={(e) => e.stopPropagation()}
              aria-label="Options du groupe"
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            <div className="dropdown-menu">
              <button 
                className="dropdown-item"
                onClick={onEdit}
              >
                <i className="fas fa-edit"></i>
                Modifier le groupe
              </button>
              <button 
                className="dropdown-item"
                onClick={() => setShowStudentSelector(true)}
                disabled={isProcessing || availableStudents.length === 0}
              >
                <i className="fas fa-user-plus"></i>
                Ajouter un étudiant
              </button>
              {fromProjectId && (
                <button 
                  className="dropdown-item"
                  onClick={handleLinkToProject}
                >
                  <i className="fas fa-project-diagram"></i>
                  Lier au projet courant
                </button>
              )}
              <div className="dropdown-divider"></div>
              {groupScope === 'active' ? (
                <button 
                  className="dropdown-item text-danger"
                  onClick={() => onDelete(id)}
                >
                  <i className="fas fa-archive"></i>
                  Archiver
                </button>
              ) : (
                <button 
                  className="dropdown-item text-primary"
                  onClick={onRestore}
                >
                  <i className="fas fa-box-open"></i>
                  Restaurer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description du groupe */}
      {description && (
        <div className="group-description-section">
          <p className="group-description">{description}</p>
        </div>
      )}

      {/* Informations de création */}
      <div className="group-meta">
        <span className="creation-date">
          <i className="fas fa-calendar"></i>
          Créé le {formatCreationDate(group.dateCreation)}
        </span>
        <span className="student-count">
          <i className="fas fa-users"></i>
          {etudiants.length} étudiant{etudiants.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-title">Avancement du groupe</span>
          <span className="progress-percentage">{pourcentageAvancement}%</span>
        </div>
        <div className="progress-container">
          <div 
            className={`progress-bar progress-${getProgressColor(pourcentageAvancement)}`}
            style={{ width: `${pourcentageAvancement}%` }}
            aria-label={`Progression: ${pourcentageAvancement}%`}
          ></div>
        </div>
      </div>

      {/* Section des étudiants */}
      <div className="students-section">
        <div className="section-header">
          <h4 className="section-title">
            <i className="fas fa-user-graduate"></i>
            Étudiants du groupe
            <span className="count-badge">{etudiants.length}</span>
          </h4>
          <button 
            className="add-button"
            onClick={() => setShowStudentSelector(true)}
            disabled={isProcessing || availableStudents.length === 0 || ((etudiants && group.maxMembers) ? etudiants.length >= group.maxMembers : etudiants.length >= 5)}
            title={etudiants.length >= (group.maxMembers || 5) ? `Capacité maximale atteinte (${group.maxMembers || 5})` : (availableStudents.length === 0 ? "Tous les étudiants sont déjà dans ce groupe" : "Ajouter un étudiant")}
          >
            <i className="fas fa-plus"></i>
            Ajouter
          </button>
        </div>
        
        {etudiants.length > 0 ? (
          <>
            <div className="students-row">
              {etudiants.slice(0, 4).map(etudiant => (
                <div
                  key={etudiant.id}
                  className="student-avatar-small"
                  title={`${etudiant.prenom || ''} ${etudiant.nom || ''}`.trim()}
                >
                  {etudiant.prenom?.charAt(0)}{etudiant.nom?.charAt(0)}
                </div>
              ))}
              {etudiants.length > 4 && (
                <div className="more-students-chip">
                  +{etudiants.length - 4}
                </div>
              )}
            </div>
            <p className="students-hint">Cliquez sur la carte pour voir tous les membres</p>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <div className="empty-message">
              <p className="empty-title">Aucun étudiant dans ce groupe</p>
              <p className="empty-description">
                Ajoutez des étudiants pour commencer à collaborer sur des projets.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section des projets */}
      {projets.length > 0 && (
        <div className="projects-section">
          <div className="section-header">
            <h4 className="section-title">
              <i className="fas fa-project-diagram"></i>
              Projets associés
              <span className="count-badge">{projets.length}</span>
            </h4>
          </div>
          <div className="projects-grid">
            {projets.slice(0, 3).map(projet => (
              <div key={projet.id} className="project-tag">
                <i className="fas fa-folder"></i>
                <span className="project-name">{projet.nom}</span>
              </div>
            ))}
            {projets.length > 3 && (
              <div className="more-projects">
                +{projets.length - 3} autre{projets.length - 3 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sélecteur d'étudiants */}
      {showStudentSelector && (
        <StudentSelector
          students={availableStudents}
          onSelect={handleAddStudent}
          onClose={() => setShowStudentSelector(false)}
          groupName={nom}
        />
      )}

      {/* Modal de confirmation pour lier le groupe au projet courant */}
      {isLinkModalOpen && (
        <ConfirmationModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          onConfirm={async () => {
            try {
              await onAddStudent(id, { __linkOnly: true, projectId: fromProjectId });
            } catch (error) {
              console.error('Erreur lors de la liaison groupe-projet:', error);
            } finally {
              setIsLinkModalOpen(false);
            }
          }}
          title="Lier ce groupe au projet"
          message={
            <>
              <p>Voulez-vous lier le groupe <strong>{nom}</strong> au projet courant&nbsp;?</p>
              <p className="warning-text">
                <i className="fas fa-info-circle"></i>
                Cette action associera ce groupe au projet sélectionné dans la gestion des projets.
              </p>
            </>
          }
          confirmText="Lier le groupe"
          cancelText="Annuler"
          type="primary"
        />
      )}

      <style jsx>{`
        .group-card {
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xs);
          padding: 1rem 1.1rem;
          border: 1px solid var(--border-color);
          transition: var(--transition);
          position: relative;
        }

        .group-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .group-main-info {
          flex: 1;
        }

        .group-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary) !important;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .group-progress-indicator {
          text-align: center;
          background: var(--bg-secondary);
          padding: 8px 12px;
          border-radius: 8px;
          min-width: 80px;
        }

        .progress-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
        }

        .progress-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .group-actions-menu {
          position: relative;
        }

        .action-button {
          background: none;
          border: none;
          padding: 8px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }

        .action-button:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .dropdown-content {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          padding: 8px 0;
          min-width: 200px;
          z-index: 10;
          display: none;
        }

        .dropdown:hover .dropdown-content {
          display: block;
        }

        .dropdown-action {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          color: var(--text-primary);
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-size: 0.875rem;
        }

        .dropdown-action:hover {
          background: var(--bg-secondary);
        }

        .dropdown-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-action {
          color: var(--danger-dark);
        }

        .delete-action:hover {
          background: var(--danger-light);
        }

        .dropdown-separator {
          height: 1px;
          background: var(--border-color);
          margin: 8px 0;
        }

        .group-description-section {
          margin-bottom: 0.75rem;
        }

        .group-description {
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
          font-size: 0.82rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .group-meta {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.9rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .creation-date, .student-count {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .progress-section {
          margin-bottom: 0.9rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-title {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .progress-percentage {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-container {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-success {
          background: var(--success-dark);
        }

        .progress-warning {
          background: var(--warning-dark);
        }

        .progress-danger {
          background: var(--danger-dark);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .count-badge {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .add-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--info-dark);
          color: var(--white);
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .add-button:hover:not(:disabled) {
          background: var(--info-light);
        }

        .add-button:disabled {
          background: var(--text-muted);
          cursor: not-allowed;
        }

        .students-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .student-avatar-small {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: var(--info-dark);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .more-students-chip {
          padding: 4px 8px;
          border-radius: 999px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 500;
        }

        .students-hint {
          margin-top: 0.35rem;
          font-size: 0.72rem;
          color: var(--text-secondary);
        }

        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-muted);
        }

        .empty-icon {
          font-size: 2rem;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-title {
          font-weight: 500;
          margin: 0 0 4px 0;
          color: var(--text-secondary);
        }

        .empty-description {
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.4;
        }

        .projects-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .project-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--info-light);
          color: var(--info-dark);
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .project-name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .more-projects {
          padding: 6px 12px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .group-card {
            padding: 1rem;
          }

          .group-header {
            flex-direction: column;
            gap: 12px;
          }

          .group-actions-menu {
            align-self: flex-end;
          }

          .group-meta {
            flex-direction: column;
            gap: 8px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .add-button {
            align-self: stretch;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default GroupCard;