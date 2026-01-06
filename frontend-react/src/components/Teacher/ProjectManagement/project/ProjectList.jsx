import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import ProjectCalendar from './ProjectCalendar'; // Nouveau composant
import SearchFilter from '../../../Common/SearchFilter';
import ProjectInfoModal from './ProjectInfoModal'; 
import ConfirmationModal from '../../../Common/ConfirmationModal';
import Pagination from '../../../Common/Pagination';
import './ProjectList.css';

const ProjectList = ({
  projects, 
  archivedProjects = [],
  projectGroupsCount,
  onProjectSelect, 
  onEditProject, 
  onDeleteProject, 
  onAddTask,
  onCreateProject,
  onAssignGroups,
  onKanbanView,
}) => {
    // Navigation vers la page détail du projet
    const handleViewDetails = (project) => {
      setIsModalOpen(false);
      setTimeout(() => {
        if (typeof onProjectSelect === 'function') {
          onProjectSelect(project);
        }
      }, 0);
    };
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'calendar'
  const [projectScope, setProjectScope] = useState('active'); // 'active' ou 'archived'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    project: null
  });

  // Fonctions pour la gestion des modals
    // Dupliquer le projet
    const handleDuplicateProject = (project) => {
      const duplicated = {
        ...project,
        nom: project.nom + " (copie)",
        id: undefined,
        _id: undefined,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        // Optionnel: réinitialiser les livrables, tâches, groupes, etc.
      };
      if (onCreateProject) {
        onCreateProject(duplicated);
      }
      handleCloseModal();
    };

    // Exporter le projet (JSON)
    const handleExportProject = (project) => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${project.nom.replace(/\s+/g, '_')}_export.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      handleCloseModal();
    };
  const handleDeleteClick = (project) => {
    setDeleteModal({
      isOpen: true,
      project
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.project) {
      await onDeleteProject(deleteModal.project.id || deleteModal.project._id);
    }
    setDeleteModal({ isOpen: false, project: null });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, project: null });
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleEditProject = (project) => {
    onEditProject(project);
    handleCloseModal(); 
  };

  const handleDeleteProject = (project) => {
    onDeleteProject(project.id || project._id);
    handleCloseModal(); 
  };

  const handleAddTaskFromModal = (project) => {
    if (onAddTask) {
      onAddTask(project);
    }
    handleCloseModal();
  };

  const activeCount = projects.length;
  const archivedCount = archivedProjects.length;

  // Règle métier d'archivage :
  // - Autorisé seulement si projet terminé (statut TERMINE)
  //   OU s'il n'y a plus de tâches en cours / à faire.
  const canArchiveProject = (project) => {
    if (!project) return false;
    const statut = project.statut;
    const tasks = Array.isArray(project.taches) ? project.taches : [];
    const hasOpenTasks = tasks.some(
      (t) => t.statut === 'EN_COURS' || t.statut === 'A_FAIRE'
    );

    if (statut === 'TERMINE') return true;
    return !hasOpenTasks;
  };

  const deleteTarget = deleteModal.project;
  const isArchiveScope = projectScope === 'active';
  const isRestoreScope = projectScope === 'archived';
  const isArchiveAllowed = isArchiveScope ? canArchiveProject(deleteTarget) : true;

  const currentList = projectScope === 'active' ? projects : archivedProjects;

  // Filtrage et tri des projets
  const filteredProjects = currentList.filter(project => {
    const matchesSearch = project.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.dateCreation) - new Date(a.dateCreation);
      case 'oldest':
        return new Date(a.dateCreation) - new Date(b.dateCreation);
      case 'name':
        return a.nom.localeCompare(b.nom);
      case 'deadline':
        return new Date(a.dateFin) - new Date(b.dateFin);
      default:
        return 0;
    }
  });

  const getStatusCounts = () => {
    const counts = {
      all: currentList.length,
      PLANIFIE: currentList.filter(p => p.statut === 'PLANIFIE').length,
      EN_COURS: currentList.filter(p => p.statut === 'EN_COURS').length,
      TERMINE: currentList.filter(p => p.statut === 'TERMINE').length,
      ANNULE: currentList.filter(p => p.statut === 'ANNULE').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Pagination uniquement pour la vue grille
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const totalProjects = sortedProjects.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProjects = viewMode === 'grid'
    ? sortedProjects.slice(startIndex, startIndex + pageSize)
    : sortedProjects;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleAssignGroups = (project) => {
    if (onAssignGroups) {
      onAssignGroups(project);
    } else {
      if (!project?.id) return;
      navigate('/groups', { state: { fromProjectId: project.id } });
    }
  };

  return (
    <div className="management-container projectlist-modern">
      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={projectScope === 'active' ? 'Archiver le projet' : 'Restaurer le projet'}
        message={(() => {
          const p = deleteTarget;
          if (!p) return '';
          const taskCount = Array.isArray(p.taches) ? p.taches.length : 0;
          const undoneTasks = Array.isArray(p.taches)
            ? p.taches.filter(t => t.statut !== 'TERMINEE').length
            : 0;
          const groupCount = Array.isArray(p.groupes) ? p.groupes.length : 0;
          const baseInfo = `Résumé du projet :\n• Statut : ${p.statut || 'N/A'}\n• Tâches : ${taskCount} (dont ${undoneTasks} non terminée(s))\n• Groupes liés : ${groupCount}`;

          if (isArchiveScope) {
            const blocked = !isArchiveAllowed;
            const warning = blocked
              ? "Vous ne pouvez pas archiver ce projet tant qu'il possède des tâches en cours ou à faire. Marquez-les comme terminées ou supprimez-les avant d'archiver."
              : "Vous pourrez toujours restaurer ce projet ultérieurement depuis l'onglet 'Archivés'.";
            return [
              `Êtes-vous sûr de vouloir archiver le projet "${p.nom}" ?`,
              'Le projet sera déplacé dans vos archives.',
              '',
              baseInfo,
              '',
              warning,
            ].join('\n');
          }

          return [
            `Êtes-vous sûr de vouloir restaurer le projet "${p.nom}" ?`,
            'Le projet sera remis dans vos projets actifs.',
            '',
            baseInfo,
          ].join('\n');
        })()}
        confirmText={projectScope === 'active' ? 'Archiver' : 'Restaurer'}
        cancelText="Annuler"
        type={projectScope === 'active' ? 'warning' : 'primary'}
        confirmDisabled={isArchiveScope && !isArchiveAllowed}
        confirmTooltip={
          isArchiveScope && !isArchiveAllowed
            ? "Ce projet contient encore des tâches en cours ou à faire. Terminez-les avant de l'archiver."
            : undefined
        }
      />

      {/* Modal des détails du projet */}
      <ProjectInfoModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        onAddTask={handleAddTaskFromModal}
        onDuplicate={handleDuplicateProject}
        onExport={handleExportProject}
        onViewTasks={(project) => {
          handleCloseModal();
          if (typeof onProjectSelect === 'function') {
            onProjectSelect(project);
          }
        }}
      />

      {/* En-tête sticky avec actions */}
      <header className="page-header sticky-header" role="banner">
        <div className="header-content">
          <h1 style={{fontSize:'2rem',marginBottom:'0.2rem'}}>Gestion des Projets</h1>
          <p style={{fontSize:'1rem',marginBottom:'0'}}>Créez et gérez vos projets pédagogiques</p>
        </div>
        <div className="header-actions" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <div className="scope-toggle" style={{marginRight:'0.5rem'}}>
            <button
              className={`scope-btn ${projectScope === 'active' ? 'active' : ''}`}
              onClick={() => setProjectScope('active')}
              title="Projets actifs"
            >
              <span>Actifs</span>
              <span className="count-pill">{activeCount}</span>
            </button>
            <button
              className={`scope-btn ${projectScope === 'archived' ? 'active' : ''}`}
              onClick={() => setProjectScope('archived')}
              title="Projets archivés"
            >
              <span>Archivés</span>
              <span className="count-pill">{archivedCount}</span>
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={onCreateProject}
            aria-label="Créer un nouveau projet"
          >
            <i className="fas fa-plus"></i>
            <span style={{marginLeft:'0.5rem'}}>Nouveau Projet</span>
          </button>
          <div className="view-controls" style={{marginLeft:'0.5rem'}}>
            <div className="view-buttons">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vue grille"
                aria-label="Vue grille"
              >
                <i className="fas fa-th"></i>
              </button>
              <button
                className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
                title="Vue calendrier"
                aria-label="Vue calendrier"
              >
                <i className="fas fa-calendar-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* Filtres sticky */}
      <section className="filters-section sticky-filters" aria-label="Filtres de projet">
        <div className="filters-left">
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher un projet..."
          />
          <div className="filter-group">
            <label>Trier par:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="name">Nom</option>
              <option value="deadline">Échéance</option>
            </select>
          </div>
        </div>
        <div className="filters-right">
          <div className="status-filters">
            <button
              className={`status-filter ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
              aria-label="Tous les projets"
            >
              Tous ({statusCounts.all})
            </button>
            <button
              className={`status-filter ${statusFilter === 'PLANIFIE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('PLANIFIE')}
              aria-label="Projets planifiés"
            >
              Planifié ({statusCounts.PLANIFIE})
            </button>
            <button
              className={`status-filter ${statusFilter === 'EN_COURS' ? 'active' : ''}`}
              onClick={() => setStatusFilter('EN_COURS')}
              aria-label="Projets en cours"
            >
              En cours ({statusCounts.EN_COURS})
            </button>
            <button
              className={`status-filter ${statusFilter === 'TERMINE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('TERMINE')}
              aria-label="Projets terminés"
            >
              Terminé ({statusCounts.TERMINE})
            </button>
            <button
              className={`status-filter ${statusFilter === 'ANNULE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ANNULE')}
              aria-label="Projets annulés"
            >
              Annulé ({statusCounts.ANNULE})
            </button>
          </div>
        </div>
      </section>
      {/* Contenu selon le mode de vue et le scope (actifs / archivés) */}
      {sortedProjects.length > 0 ? (
        <>
          <main className={`projects-content ${viewMode}`} aria-label="Liste des projets">
            {viewMode === 'grid' ? (
              <div className="items-grid modern-grid">
                {paginatedProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    groupCount={projectGroupsCount?.[project.id] ?? (project.groupes ? project.groupes.length : 0)}
                    onSelect={() => handleProjectSelect(project)}
                    onEdit={onEditProject}
                    onDelete={() => handleDeleteClick(project)}
                    onAddTask={onAddTask}
                    onAddGroups={handleAssignGroups}
                    showActions={true}
                    archiveActionLabel={projectScope === 'active' ? 'Archiver' : 'Restaurer'}
                    statusBadge={project.statut}
                    deadline={project.dateFin}
                    taskCount={project.taches ? project.taches.length : 0}
                    onViewTasks={(proj) => {
                      if (typeof onProjectSelect === 'function') {
                        onProjectSelect(proj);
                      }
                    }}
                    onKanban={onKanbanView}
                  />
                ))}
              </div>
            ) : (
              <ProjectCalendar
                projects={sortedProjects}
                onProjectSelect={handleProjectSelect}
                onEditProject={onEditProject}
                onDeleteProject={handleDeleteClick}
              />
            )}
          </main>

          {viewMode === 'grid' && (
            <Pagination
              totalItems={totalProjects}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      ) : (
        <div className="empty-state modern-empty" role="status" aria-live="polite">
          <div className="empty-icon">
            <img src="/public/illustrations/empty-folder.svg" alt="Aucun projet" style={{width:'80px',opacity:0.7}} />
          </div>
          <h3>
            {projectScope === 'active'
              ? 'Aucun projet actif trouvé'
              : 'Aucun projet archivé trouvé'}
          </h3>
          <p>
            {projectScope === 'active'
              ? (projects.length === 0 
                  ? "Commencez par créer votre premier projet"
                  : "Aucun projet ne correspond à vos critères de recherche")
              : (archivedProjects.length === 0
                  ? "Aucun projet n'a encore été archivé"
                  : "Aucun projet archivé ne correspond à vos critères")}
          </p>
          {projectScope === 'active' && projects.length === 0 && (
            <button 
              className="btn btn-primary"
              onClick={onCreateProject}
              aria-label="Créer un projet"
            >
              <i className="fas fa-plus"></i>
              <span style={{marginLeft:'0.5rem'}}>Créer un projet</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;