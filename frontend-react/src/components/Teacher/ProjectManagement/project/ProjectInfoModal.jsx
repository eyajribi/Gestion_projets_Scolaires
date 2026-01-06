import React, { useState, useEffect } from "react";

const ProjectInfoModal = ({ project, isOpen, onClose, onEdit, onDelete, onDuplicate, onExport, onViewTasks }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showAllObjectives, setShowAllObjectives] = useState(false);
  const [showAllResources, setShowAllResources] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset states when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen && project) {
      setIsDescriptionExpanded(false);
      setShowAllObjectives(false);
      setShowAllResources(false);
      setProgress(0);

      // Animation de progression
      const targetProgress = project.pourcentageAvancement || 0;
      const duration = 800;
      const steps = 40;
      const increment = targetProgress / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetProgress) {
          current = targetProgress;
          clearInterval(timer);
        }
        setProgress(Math.floor(current));
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isOpen, project]);

  // Fermer la modal avec ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(project.dateFin);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusInfo = (statut) => {
    switch (statut) {
      case "ACTIF":
        return {
          color: "#10b981",
          label: "En cours",
          icon: "fas fa-play-circle",
        };
      case "TERMINE":
        return {
          color: "#3b82f6",
          label: "Terminé",
          icon: "fas fa-check-circle",
        };
      case "PLANIFIE":
        return { color: "#06b6d4", label: "Planifié", icon: "fas fa-clock" };
      case "EN_PAUSE":
        return {
          color: "#f59e0b",
          label: "En pause",
          icon: "fas fa-pause-circle",
        };
      case "ANNULE":
        return {
          color: "#ef4444",
          label: "Annulé",
          icon: "fas fa-times-circle",
        };
      case "EN_COURS":
        return {
          color: "#10b981",
          label: "En cours",
          icon: "fas fa-play-circle",
        };
      default:
        return { color: "#6b7280", label: statut, icon: "fas fa-circle" };
    }
  };

  const getPriorityInfo = (priorite) => {
    switch (priorite) {
      case "HAUTE":
        return {
          color: "#ef4444",
          label: "Haute",
          icon: "fas fa-exclamation-triangle",
        };
      case "MOYENNE":
        return {
          color: "#f59e0b",
          label: "Moyenne",
          icon: "fas fa-exclamation-circle",
        };
      case "BASSE":
        return { color: "#10b981", label: "Basse", icon: "fas fa-info-circle" };
      default:
        return null; // Pas de badge de priorité si non définie
    }
  };

  const calculateCompletionRate = () => {
    const totalTasks = project.taches?.length || 0;
    const completedTasks =
      project.taches?.filter((t) => t.statut === "TERMINEE").length || 0;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "DOCUMENT":
        return "fa-file-pdf";
      case "LINK":
        return "fa-link";
      case "VIDEO":
        return "fa-video";
      case "IMAGE":
        return "fa-image";
      default:
        return "fa-file";
    }
  };

  const statusInfo = getStatusInfo(project.statut);
  const priorityInfo = getPriorityInfo(project.priorite);
  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining < 0;
  const completionRate = calculateCompletionRate();
  const totalTasks = project.taches?.length || 0;
  const studentsCount =
    project.groupes?.reduce(
      (total, groupe) => total + (groupe.membres?.length || 0),
      0
    ) || 0;
  const deliverablesCount = project.livrables?.length || 0;
  const commentsCount = project.commentaires?.length || 0;
  const hasAnyMetrics =
    totalTasks > 0 ||
    studentsCount > 0 ||
    deliverablesCount > 0 ||
    commentsCount > 0;

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const getDescriptionPreview = () => {
    if (!project.description) return "Aucune description fournie";

    if (project.description.length <= 150 || isDescriptionExpanded) {
      return project.description;
    }

    return project.description.substring(0, 150) + "...";
  };

  const displayedObjectives = showAllObjectives
    ? project.objectifs
    : project.objectifs?.slice(0, 3) || [];

  const displayedResources = showAllResources
    ? project.ressources
    : project.ressources?.slice(0, 3) || [];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit(project);
    onClose();
  };

  const handleDuplicate = (project) => {
    if (typeof onDuplicate === "function") {
      onDuplicate(project);
    }
  };

  const handleExport = (project) => {
    if (typeof onExport === "function") {
      onExport(project);
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir archiver le projet "${project.nom}" ?`
      )
    ) {
      onDelete(project);
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`modal-overlay ${isOpen ? "active" : ""}`}
        onClick={handleBackdropClick}
      >
        {/* Modal */}
        <div className="project-info-modal">
          {/* En-tête de la modal */}
          <div className="modal-header">
            <div className="modal-title-section">
              <h2>{project.nom}</h2>
              <div className="modal-subtitle">
                <span>Créé le {formatDate(project.dateCreation)}</span>
                {project.dateModification && (
                  <span>
                    • Modifié le {formatDate(project.dateModification)}
                  </span>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-icon"
                onClick={handleEdit}
                title="Modifier le projet"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                className="btn btn-icon text-danger"
                onClick={handleDelete}
                title="Archiver le projet"
              >
                <i className="fas fa-archive"></i>
              </button>
              <button
                className="btn btn-icon"
                onClick={() => handleDuplicate(project)}
                title="Dupliquer le projet"
              >
                <i className="fas fa-copy"></i>
              </button>
              <button
                className="btn btn-icon"
                onClick={() => handleExport(project)}
                title="Exporter le projet"
              >
                <i className="fas fa-download"></i>
              </button>
              <button className="btn btn-icon" onClick={onClose} title="Fermer">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Contenu de la modal */}
          <div className="modal-content">
            {/* En-tête avec statut et priorité */}
            <div className="info-header">
              <div className="status-badges">
                <div
                  className="status-badge"
                  style={{
                    backgroundColor: `${statusInfo.color}15`,
                    color: statusInfo.color,
                    border: `1px solid ${statusInfo.color}30`,
                  }}
                >
                  <i className={statusInfo.icon}></i>
                  {statusInfo.label}
                </div>
                {priorityInfo && (
                  <div
                    className="status-badge"
                    style={{
                      backgroundColor: `${priorityInfo.color}15`,
                      color: priorityInfo.color,
                      border: `1px solid ${priorityInfo.color}30`,
                    }}
                  >
                    <i className={priorityInfo.icon}></i>
                    {priorityInfo.label}
                  </div>
                )}
              </div>

              {/* Compte à rebours avec animation */}
              <div
                className={`deadline-indicator ${isOverdue ? "overdue" : ""} ${
                  daysRemaining <= 3 ? "urgent" : ""
                }`}
              >
                <i
                  className={`fas ${
                    isOverdue ? "fa-exclamation-triangle" : "fa-calendar-alt"
                  }`}
                ></i>
                <span>
                  {isOverdue
                    ? `En retard de ${Math.abs(daysRemaining)} jour${
                        Math.abs(daysRemaining) > 1 ? "s" : ""
                      }`
                    : daysRemaining === 0
                    ? "Termine aujourd'hui"
                    : `${daysRemaining} jour${
                        daysRemaining > 1 ? "s" : ""
                      } restant${daysRemaining > 1 ? "s" : ""}`}
                </span>
                {daysRemaining <= 3 && daysRemaining > 0 && (
                  <div className="pulse-animation"></div>
                )}
              </div>
            </div>

            {/* Description du projet */}
            <div className="description-section">
              <h4>Description du projet</h4>
              <div className="description-content">
                <p>{getDescriptionPreview()}</p>
                {project.description && project.description.length > 150 && (
                  <button
                    className="btn btn-text btn-sm"
                    onClick={toggleDescription}
                  >
                    <i
                      className={`fas fa-chevron-${
                        isDescriptionExpanded ? "up" : "down"
                      }`}
                    ></i>
                    {isDescriptionExpanded ? "Voir moins" : "Voir plus"}
                  </button>
                )}
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <i className="fas fa-calendar-plus"></i>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Date de début</div>
                  <div className="detail-value">
                    {formatDate(project.dateDebut)}
                  </div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Date de fin</div>
                  <div className="detail-value">
                    {formatDate(project.dateFin)}
                  </div>
                </div>
              </div>

              {totalTasks > 0 && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <i className="fas fa-bullseye"></i>
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Taux de complétion</div>
                    <div className="detail-value">
                      <span className="completion-rate">{completionRate}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Objectifs du projet */}
            {project.objectifs && project.objectifs.length > 0 && (
              <div className="objectives-section">
                <div className="section-header">
                  <h4>Objectifs principaux</h4>
                  <span className="objectives-count">
                    {project.objectifs.length} objectif
                    {project.objectifs.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="objectives-list">
                  {displayedObjectives.map((objectif, index) => (
                    <div key={index} className="objective-item">
                      <i
                        className="fas fa-check-circle"
                        style={{ color: statusInfo.color }}
                      ></i>
                      <span>{objectif}</span>
                    </div>
                  ))}
                  {project.objectifs.length > 3 && (
                    <button
                      className="btn btn-text btn-sm"
                      onClick={() => setShowAllObjectives(!showAllObjectives)}
                    >
                      <i
                        className={`fas fa-chevron-${
                          showAllObjectives ? "up" : "down"
                        }`}
                      ></i>
                      {showAllObjectives
                        ? "Voir moins"
                        : `Voir les ${
                            project.objectifs.length - 3
                          } autres objectifs`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Métriques rapides */}
            <div className="metrics-section">
              <h4 className="description-section">Métriques du projet</h4>
              {hasAnyMetrics ? (
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div
                      className="metric-icon"
                      style={{
                        backgroundColor: `${statusInfo.color}15`,
                        color: statusInfo.color,
                      }}
                    >
                      <i className="fas fa-tasks"></i>
                    </div>
                    <div className="metric-content">
                      <div className="metric-value">{totalTasks}</div>
                      <div className="metric-label">Tâches totales</div>
                    </div>
                  </div>

                </div>
              ) : (
                <p className="metrics-empty">
                  Aucune commentaire pour le moment.
                </p>
              )}
            </div>

            {/* Ressources et documents */}
            {project.ressources && project.ressources.length > 0 && (
              <div className="resources-section">
                <div className="section-header">
                  <h4 className="description-section">Ressources</h4>
                  <span className="resources-count">
                    {project.ressources.length} ressource
                    {project.ressources.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="resources-list">
                  {displayedResources.map((ressource, index) => (
                    <div key={index} className="resource-item">
                      <div className="resource-icon">
                        <i
                          className={`fas ${getResourceIcon(ressource.type)}`}
                        ></i>
                      </div>
                      <span className="resource-name">{ressource.nom}</span>
                      <div className="resource-actions">
                        <a
                          href={ressource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-icon btn-sm"
                          title="Télécharger"
                        >
                          <i className="fas fa-download"></i>
                        </a>
                        <button
                          className="btn btn-icon btn-sm"
                          title="Voir les détails"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {project.ressources.length > 3 && (
                    <button
                      className="btn btn-text btn-sm"
                      onClick={() => setShowAllResources(!showAllResources)}
                    >
                      <i
                        className={`fas fa-chevron-${
                          showAllResources ? "up" : "down"
                        }`}
                      ></i>
                      {showAllResources
                        ? "Voir moins"
                        : `Voir les ${
                            project.ressources.length - 3
                          } autres ressources`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Section de progression détaillée */}
            <div className="progress-breakdown">
              <h4 className="description-section">Détail de l'avancement</h4>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <div className="breakdown-label">Tâches complétées</div>
                  <div className="breakdown-value">
                    {project.taches?.filter((t) => t.statut === "TERMINEE")
                      .length || 0}{" "}
                    / {project.taches?.length || 0}
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-label">Jours écoulés</div>
                  {(() => {
                    const now = new Date();
                    const start = new Date(project.dateDebut);
                    const end = new Date(project.dateFin);
                    const msPerDay = 1000 * 60 * 60 * 24;

                    const rawElapsed = (now - start) / msPerDay;
                    const rawTotal = (end - start) / msPerDay;

                    const elapsedDays = rawElapsed <= 0 ? 0 : Math.ceil(rawElapsed);
                    const totalDays = rawTotal <= 0 ? 0 : Math.ceil(rawTotal);

                    let ratio = 0;
                    if (rawTotal > 0) {
                      if (rawElapsed <= 0) {
                        ratio = 0;
                      } else if (rawElapsed >= rawTotal) {
                        ratio = 1;
                      } else {
                        ratio = rawElapsed / rawTotal;
                      }
                    }

                    const widthPercent = Math.min(
                      100,
                      Math.max(0, Math.round(ratio * 100))
                    );

                    return (
                      <>
                        <div className="breakdown-value">
                          {elapsedDays} / {totalDays}
                        </div>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${widthPercent}%`,
                              backgroundColor: isOverdue ? "#ef4444" : "#10b981",
                            }}
                          ></div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Pied de modal avec actions */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Fermer
            </button>
            <div className="footer-actions">
              <button className="btn btn-primary" onClick={() => onViewTasks && onViewTasks(project)}>
                <i className="fas fa-tasks"></i>
                Voir les tâches
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Styles de la modal */
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
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          padding: 20px;
        }

        .modal-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        .project-info-modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          transform: scale(0.9);
          opacity: 0;
          transition: all 0.3s ease;
        }

        .modal-overlay.active .project-info-modal {
          transform: scale(1);
          opacity: 1;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 32px;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 16px 16px 0 0;
        }

        .modal-title-section h2 {
          margin: 0 0 8px 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
        }

        .modal-subtitle {
          display: flex;
          gap: 12px;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .modal-actions {
          display: flex;
          gap: 8px;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          max-height: calc(90vh - 140px);
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          border-top: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 0 0 16px 16px;
        }

        .footer-actions {
          display: flex;
          gap: 12px;
        }

        /* Reste des styles (identique au composant précédent) */
        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .description-section {
          margin-bottom: 2rem;
          color: #000000; /* ou #1f2937 pour une couleur gris foncé */
        }

        .description-section h4 {
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .description-content p {
          color: #000000; /* Force la couleur noire */
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }

        .status-badges {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .deadline-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-weight: 600;
          position: relative;
        }

        .deadline-indicator.overdue {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        .deadline-indicator.urgent {
          background: #fffbeb;
          border-color: #fed7aa;
          color: #ea580c;
          animation: pulse 2s infinite;
        }

        .pulse-animation {
          position: absolute;
          top: 50%;
          right: -8px;
          width: 8px;
          height: 8px;
          background: #ea580c;
          border-radius: 50%;
          transform: translateY(-50%);
          animation: pulse-dot 1.5s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(234, 88, 12, 0);
          }
        }

        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translateY(-50%) scale(1.2);
          }
        }

        .description-section,
        .objectives-section,
        .metrics-section,
        .resources-section,
        .progress-breakdown {
          margin-bottom: 2rem;
        }
        .description-section {
          color: black;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h4 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .objectives-count,
        .resources-count {
          color: #6b7280;
          font-size: 0.9rem;
          background: #f3f4f6;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .detail-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: #3b82f6;
          color: white;
          border-radius: 10px;
          font-size: 1.25rem;
        }

        .detail-content {
          flex: 1;
        }

        .detail-label {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .detail-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .progress-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-value {
          min-width: 3rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease-in-out;
        }

        .completion-rate {
          color: #10b981;
          font-weight: 700;
        }

        .objectives-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .objective-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .objective-item:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }

        .objective-item i {
          margin-top: 0.125rem;
          flex-shrink: 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          font-size: 1.5rem;
        }

        .metric-content {
          flex: 1;
        }

        .metric-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .metric-label {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .resources-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .resource-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .resource-item:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }

        .resource-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #3b82f6;
          color: white;
          border-radius: 8px;
          font-size: 1rem;
        }

        .resource-name {
          flex: 1;
          font-weight: 500;
          color: #1f2937;
        }

        .resource-actions {
          display: flex;
          gap: 0.5rem;
        }

        .progress-breakdown {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 12px;
        }

        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .breakdown-label {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .breakdown-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .breakdown-bar {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .breakdown-fill {
          height: 100%;
          border-radius: 3px;
          background: #3b82f6;
          transition: width 0.5s ease-in-out;
        }

        /* Boutons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .btn-primary:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
          border-color: #6b7280;
        }

        .btn-secondary:hover {
          background: #4b5563;
          border-color: #4b5563;
        }

        .btn-outline {
          background: transparent;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .btn-outline:hover {
          background: #3b82f6;
          color: white;
        }

        .btn-text {
          background: transparent;
          border: none;
          color: #3b82f6;
          padding: 0.25rem 0.5rem;
        }

        .btn-text:hover {
          background: #eff6ff;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid #d1d5db;
          background: white;
          color: #6b7280;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-icon:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8rem;
        }

        .text-danger {
          color: #ef4444;
        }

        .text-danger:hover {
          background: #fef2f2;
          border-color: #fecaca;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modal-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .modal-actions {
            align-self: flex-end;
          }

          .modal-content {
            padding: 24px;
          }

          .modal-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .footer-actions {
            justify-content: space-between;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .breakdown-grid {
            grid-template-columns: 1fr;
          }

          .info-header {
            flex-direction: column;
            align-items: stretch;
          }
        }

        @media (max-width: 480px) {
          .modal-overlay {
            padding: 10px;
          }

          .project-info-modal {
            max-height: 95vh;
          }

          .modal-content {
            padding: 16px;
            max-height: calc(95vh - 140px);
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .detail-item {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }

          .metric-card {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }

          .resource-item {
            flex-wrap: wrap;
          }

          .resource-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default ProjectInfoModal;
