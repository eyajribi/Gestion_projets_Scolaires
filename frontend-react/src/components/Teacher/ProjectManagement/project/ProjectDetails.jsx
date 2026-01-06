import React, { useState, useEffect } from 'react';
import TaskList from '../tache/TaskList';
import DeliverableList from '../livrable/DeliverableList';
import ProjectInfo from './ProjectInfoModal';
import TeamMembers from '../group/TeamMembers';
import ProgressChart from '../../../Common/ProgressChart';
import LoadingSpinner from '../../../UI/LoadingSpinner';

const ProjectDetails = ({ 
  project, 
  tasks, 
  taskStats, 
  onUpdateTaskStatus, 
  onAddTask, 
  onEditProject, 
  onDeleteProject, 
  onRefreshTasks,
  onBack,
  initialTab = 'overview',
  setProjectDetailsTab
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
    if (setProjectDetailsTab) setProjectDetailsTab(undefined);
  }, [initialTab, setProjectDetailsTab]);

  // Recharger les tâches quand le composant est monté
  useEffect(() => {
    if (project?.id && onRefreshTasks) {
      onRefreshTasks();
    }
  }, [project?.id, onRefreshTasks]);

  if (!project) {
    return (
      <div className="project-details-loading">
        <LoadingSpinner />
        <p>Chargement du projet...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'fas fa-eye' },
    { id: 'tasks', label: 'Tâches', icon: 'fas fa-tasks' },
    { id: 'deliverables', label: 'Livrables', icon: 'fas fa-file-upload' },
    { id: 'team', label: 'Équipe', icon: 'fas fa-users' },
    { id: 'analytics', label: 'Analytiques', icon: 'fas fa-chart-line' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-content">
            <div className="overview-left">
              <ProjectInfo 
                project={project} 
                onViewTasks={() => setActiveTab('tasks')} 
              />
              <ProgressChart project={project} />
            </div>
            <div className="overview-right">
              <TeamMembers project={project} />
              <div className="quick-stats">
                <h4>Statistiques rapides</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">
                      {taskStats?.total || 0}
                    </div>
                    <div className="stat-label">Tâches totales</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {taskStats?.completed || 0}
                    </div>
                    <div className="stat-label">Terminées</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {taskStats?.delayed || 0}
                    </div>
                    <div className="stat-label">En retard</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {project.pourcentageAvancement || 0}%
                    </div>
                    <div className="stat-label">Avancement global</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <TaskList
            tasks={tasks || []}
            onUpdateStatus={onUpdateTaskStatus}
            onAddTask={onAddTask}
            projectId={project.id}
            project={project}
            onEdit={onEditTask}
          />
        );

      case 'deliverables':
        return (
          <DeliverableList
            project={project}
          />
        );

      case 'team':
        return (
          <TeamMembers 
            project={project} 
            showDetails={true}
          />
        );

      case 'analytics':
        return (
          <div className="analytics-content">
            <ProgressChart 
              project={project} 
              tasks={tasks}
              detailed={true} 
            />
            {/* Autres graphiques et statistiques détaillées */}
            <div className="analytics-grid">
              <div className="analytics-card">
                <h5>Répartition des tâches</h5>
                <div className="status-distribution">
                  <div className="status-item">
                    <span className="status-dot a-faire"></span>
                    <span>À faire: {taskStats?.todo || 0}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot en-cours"></span>
                    <span>En cours: {taskStats?.inProgress || 0}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot terminee"></span>
                    <span>Terminées: {taskStats?.completed || 0}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot en-retard"></span>
                    <span>En retard: {taskStats?.delayed || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="project-details">
      {/* En-tête avec navigation */}
      <div className="details-header">
        <div className="header-left">
          <a href="/teacher-dashboard" className="btn btn-link" style={{marginRight: '1rem'}}>
            <i className="fas fa-home"></i> Tableau de bord
          </a>
          <div className="project-title-section">
            <h1>{project.nom}</h1>
            <div className="project-meta">
              <span className="project-status">
                <i className="fas fa-circle"></i>
                {project.statut}
              </span>
              <span className="project-dates">
                {new Date(project.dateDebut).toLocaleDateString('fr-FR')} - {new Date(project.dateFin).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={onAddTask}
          >
            <i className="fas fa-plus"></i>
            Nouvelle tâche
          </button>
          <button 
            className="btn btn-outline"
            onClick={onEditProject}
          >
            <i className="fas fa-edit"></i>
            Modifier
          </button>
          <div className="dropdown">
            <button className="btn btn-icon">
              <i className="fas fa-ellipsis-v"></i>
            </button>
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={onRefreshTasks}>
                <i className="fas fa-sync-alt"></i>
                Actualiser les tâches
              </button>
              <button className="dropdown-item">
                <i className="fas fa-copy"></i>
                Dupliquer le projet
              </button>
              <button className="dropdown-item">
                <i className="fas fa-download"></i>
                Exporter les données
              </button>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item text-danger"
                onClick={onDeleteProject}
              >
                <i className="fas fa-trash"></i>
                Supprimer le projet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="details-tabs">
        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              {tab.label}
              {tab.id === 'tasks' && tasks && (
                <span className="tab-badge">{tasks.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu de l'onglet */}
      <div className="details-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProjectDetails;