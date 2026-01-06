import React, { useState } from 'react';
import PriorityBadge from '../../../Common/PriorityBadge';
import StatusBadge from '../../../Common/StatusBadge';
import ProgressBar from '../../../Common/ProgressBar';

const ProjectCard = ({ 
  project, 
  groupCount,
  compact = false, 
  showActions = false,
  onSelect, 
  onEdit, 
  onAddGroups,
  onDelete, 
  onAddTask,
  archiveActionLabel,
  onViewTasks,
  onKanban,
}) => {
  const {
    id,
    nom,
    description,
    statut,
    dateDebut,
    dateFin,
    taches = [],
    groupes = []
  } = project;

  // Calcul dynamique de l'avancement (moyenne réelle sur toutes les tâches)
  let progress = 0;
  if (taches.length === 0) {
    progress = 0;
  } else {
    const sum = taches.reduce((acc, t) => {
      if (typeof t.pourcentageAvancement === 'number' && !isNaN(t.pourcentageAvancement)) {
        return acc + Math.max(0, Math.min(100, t.pourcentageAvancement));
      } else if (t.statut === 'TERMINEE') {
        return acc + 100;
      } else {
        return acc + 0;
      }
    }, 0);
    progress = Math.round(sum / taches.length);
  }

  const isArchivedView = archiveActionLabel === 'Restaurer';

  const effectiveGroupCount =
    typeof groupCount === 'number'
      ? groupCount
      : Array.isArray(groupes)
        ? groupes.length
        : 0;

  const calculateDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = calculateDaysLeft(dateFin);
  const isLate = daysLeft < 0 && statut !== 'TERMINE';
  const completedTasks = taches.filter(t => t.statut === 'TERMINEE').length;
  const totalTasks = taches.length;

  const handleAction = (e, action) => {
    e.stopPropagation();
    if (typeof action === 'function') {
      action(project);
    }
  };

  const [descExpanded, setDescExpanded] = useState(false);

  const maxDescLength = 120;
  const shouldTruncate = description && description.length > maxDescLength;
  const descToShow = !descExpanded && shouldTruncate
    ? description.slice(0, maxDescLength) + '...'
    : description;

  return (
    <div 
      className={`project-card modernized ${compact ? 'compact' : ''} ${isLate ? 'late' : ''}`}
      onClick={() => onSelect && onSelect(project)}
      style={{
        boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
        borderRadius: 20,
        padding: compact ? '1rem' : '2rem',
        border: '1.5px solid #e5e7eb',
        background: '#fff',
        transition: 'box-shadow 0.2s, border 0.2s',
        marginBottom: 18,
        position: 'relative',
        maxWidth: 420,
        minWidth: 260,
        width: '100%',
        wordBreak: 'break-word',
        overflow: 'hidden',
      }}
    >
      {/* En-tête de la carte */}
      <div className="project-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <div className="project-title-section" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h3 className="project-title" style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#1e293b', letterSpacing: 0.2, whiteSpace: 'pre-line', wordBreak: 'break-word', flex: 'none', maxWidth: 260, overflowWrap: 'break-word' }}>{nom}</h3>
          <StatusBadge status={statut} />
        </div>
        {showActions && (
          <div className="project-actions" style={{ marginLeft: 12 }}>
            <div className="dropdown">
              <button className="btn-icon" onClick={(e) => e.stopPropagation()} style={{ border: 'none', background: 'transparent', fontSize: 20, color: '#64748b' }}>
                <i className="fas fa-ellipsis-v"></i>
              </button>
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={(e) => handleAction(e, onEdit)}><i className="fas fa-edit"></i> Modifier</button>
                {onAddGroups && (<button className="dropdown-item" onClick={(e) => handleAction(e, onAddGroups)}><i className="fas fa-plus"></i> Affecter des groupes</button>)}
                <button className="dropdown-item" onClick={(e) => handleAction(e, onAddTask)}><i className="fas fa-plus"></i> Ajouter une tâche</button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger" onClick={(e) => handleAction(e, onDelete)}><i className="fas fa-archive"></i> {archiveActionLabel || 'Archiver'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description (tronquée si longue) */}
      {!compact && description && (
        <div className="project-description" style={{ position: 'relative', marginBottom: 8 }}>
          <span>{descToShow}</span>
          {shouldTruncate && !descExpanded && (
            <button
              className="btn btn-link btn-xs"
              style={{ marginLeft: 8, color: '#2563eb', fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={e => { e.stopPropagation(); setDescExpanded(true); }}
            >
              Voir plus
            </button>
          )}
          {shouldTruncate && descExpanded && (
            <button
              className="btn btn-link btn-xs"
              style={{ marginLeft: 8, color: '#2563eb', fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={e => { e.stopPropagation(); setDescExpanded(false); }}
            >
              Réduire
            </button>
          )}
        </div>
      )}

      {/* Métadonnées */}
      <div className="project-meta">
        <div className="meta-item">
          <i className="fas fa-calendar-alt"></i>
          <span>Échéance: {new Date(dateFin).toLocaleDateString('fr-FR')}</span>
        </div>
        {isArchivedView && project.dateArchivage && (
          <div className="meta-item">
            <i className="fas fa-box-archive"></i>
            <span>
              Archivé le {new Date(project.dateArchivage).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
        <div className="meta-item">
          <i className="fas fa-users"></i>
          <span>
            {effectiveGroupCount} groupe(s)
            {!compact && onAddGroups && effectiveGroupCount > 0 && (
              <button
                type="button"
                className="link-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddGroups(project);
                }}
              >
                Voir les groupes
              </button>
            )}
          </span>
        </div>
        {!compact && (
          <div className="meta-item">
            <i className="fas fa-tasks"></i>
            <span>{completedTasks}/{totalTasks} tâches</span>
          </div>
        )}
      </div>

      {/* Voir les tâches */}
      {!compact && (
        <div style={{ margin: '0.7rem 0 0.7rem 0', display: 'flex', gap: 12 }}>
          <button
            className="btn btn-outline btn-sm modern-btn"
            style={{ padding: '0.5rem 1.4rem', fontWeight: 700, letterSpacing: 0.2, borderRadius: 8, fontSize: 15, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px #3b82f622', border: '1.5px solid #3b82f6', color: '#2563eb', background: '#f8fafc', transition: 'background 0.2s, color 0.2s' }}
            onClick={e => { e.stopPropagation(); if (onViewTasks) onViewTasks(project); }}
            onMouseOver={e => e.currentTarget.style.background = '#e0e7ef'}
            onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
          >
            <i className="fas fa-tasks" style={{ marginRight: 8, fontSize: 17 }}></i>
            Voir les tâches
          </button>
          <button
            className="btn btn-outline btn-sm modern-btn"
            style={{ padding: '0.5rem 1.4rem', fontWeight: 700, letterSpacing: 0.2, borderRadius: 8, fontSize: 15, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px #3b82f622', border: '1.5px solid #10b981', color: '#10b981', background: '#f8fafc', transition: 'background 0.2s, color 0.2s' }}
            onClick={e => { e.stopPropagation(); if (onKanban) onKanban(project); }}
            title="Vue Kanban"
            onMouseOver={e => e.currentTarget.style.background = '#d1fae5'}
            onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
          >
            <i className="fas fa-columns" style={{ marginRight: 8, fontSize: 17 }}></i>
            Kanban
          </button>
        </div>
      )}

      {/* Barre de progression */}
      <div className="project-progress" style={{ marginTop: 18, marginBottom: 8 }}>
        <div className="progress-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: '#64748b' }}>Avancement</span>
          <span style={{ fontWeight: 700, color: isLate ? '#ef4444' : '#2563eb' }}>{progress}%</span>
        </div>
        <ProgressBar 
          value={progress} 
          max={100}
          color={isLate ? 'danger' : 'primary'}
        />
      </div>

      {/* Affichage du nombre de tâches uniquement */}
      {!compact && (
        <div className="project-tasks-count" style={{ margin: '10px 0', fontWeight: 600, color: '#64748b', fontSize: 16 }}>
          <i className="fas fa-tasks" style={{ marginRight: 6 }}></i>
          {completedTasks}/{totalTasks} tâches
        </div>
      )}

      {/* Alerte de retard */}
      {isLate && (
        <div className="project-alert">
          <i className="fas fa-exclamation-triangle"></i>
          <span>En retard de {Math.abs(daysLeft)} jour(s)</span>
        </div>
      )}

      {/* Indicateur de jours restants */}
      {!isLate && daysLeft <= 7 && (
        <div className="project-warning">
          <i className="fas fa-clock"></i>
          <span>{daysLeft} jour(s) restant(s)</span>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;