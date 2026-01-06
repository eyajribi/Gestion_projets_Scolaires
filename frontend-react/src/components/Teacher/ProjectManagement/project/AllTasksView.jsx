import React, { useState, useEffect } from 'react';
import { projectService } from '../../../../services/projectService';
import TaskCard from '../tache/TaskCard';
import SearchFilter from '../../../Common/SearchFilter';
import LoadingSpinner from '../../../UI/LoadingSpinner';
import './AllTasksView.css';

const AllTasksView = ({ projects, getProjectTasks, onUpdateTaskStatus, onTaskSelect, onEditTask, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState('none'); // 'none', 'project', 'status', 'priority'
  const [savedViews, setSavedViews] = useState([]);
  const [fullProjects, setFullProjects] = useState([]);

  // Charger tous les projets avec leurs groupes et membres complets
  useEffect(() => {
    const loadFullProjectsAndTasks = async () => {
      try {
        setLoading(true);
        // Fetch full project details for each project
        const fulls = await Promise.all(projects.map(async (p) => {
          try {
            const full = await projectService.getProjectById(p.id);
            return full.data || full;
          } catch (e) {
            return p; // fallback to shallow if error
          }
        }));
        setFullProjects(fulls);
        // Now load all tasks for each full project
        const tasksPromises = fulls.map(async (project) => {
          const tasks = await getProjectTasks(project.id);
          return tasks.map(task => ({
            ...task,
            projectName: project.nom,
            projectId: project.id
          }));
        });
        const tasksResults = await Promise.all(tasksPromises);
        const allTasksData = tasksResults.flat();
        setAllTasks(allTasksData);
      } catch (error) {
        console.error('Erreur chargement toutes les tâches:', error);
      } finally {
        setLoading(false);
      }
    };
    if (projects.length > 0) {
      loadFullProjectsAndTasks();
    }
  }, [projects, getProjectTasks]);

  // Filtrer les tâches
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.statut === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priorite === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  // Trier les tâches
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.dateEcheance) - new Date(b.dateEcheance);
      case 'priority':
        const priorityOrder = { URGENTE: 0, HAUTE: 1, MOYENNE: 2, BASSE: 3 };
        return priorityOrder[a.priorite] - priorityOrder[b.priorite];
      case 'status':
        const statusOrder = { EN_RETARD: 0, A_FAIRE: 1, EN_COURS: 2, TERMINEE: 3 };
        return statusOrder[a.statut] - statusOrder[b.statut];
      case 'title':
        return a.titre.localeCompare(b.titre);
      case 'project':
        return a.projectName.localeCompare(b.projectName);
      default:
        return 0;
    }
  });

  // Grouper les tâches
  const groupedTasks = () => {
    switch (groupBy) {
      case 'project':
        const byProject = {};
        sortedTasks.forEach(task => {
          if (!byProject[task.projectName]) {
            byProject[task.projectName] = [];
          }
          byProject[task.projectName].push(task);
        });
        return byProject;

      case 'status':
        const byStatus = {};
        sortedTasks.forEach(task => {
          if (!byStatus[task.statut]) {
            byStatus[task.statut] = [];
          }
          byStatus[task.statut].push(task);
        });
        return byStatus;

      case 'priority':
        const byPriority = {};
        sortedTasks.forEach(task => {
          if (!byPriority[task.priorite]) {
            byPriority[task.priorite] = [];
          }
          byPriority[task.priorite].push(task);
        });
        return byPriority;

      default:
        return { 'Toutes les tâches': sortedTasks };
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) return;

      // Déléguée au parent qui connaît le projet pour mettre à jour
      // le backend et le state global (projectTasks)
      await onUpdateTaskStatus(task.projectId, taskId, newStatus);

      // Mettre aussi à jour l'état local de la vue globale
      setAllTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, statut: newStatus } : t
        )
      );
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };

  const handleTaskSelect = (task) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const getTaskStats = () => {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.statut === 'TERMINEE').length;
    const inProgress = allTasks.filter(t => t.statut === 'EN_COURS').length;
    const delayed = allTasks.filter(t => t.statut === 'EN_RETARD').length;
    const todo = allTasks.filter(t => t.statut === 'A_FAIRE').length;

    return { total, completed, inProgress, delayed, todo };
  };

  const stats = getTaskStats();

  // Charger les vues enregistrées depuis le stockage local
  useEffect(() => {
    try {
      const stored = localStorage.getItem('allTasksViewSavedViews');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedViews(parsed);
        }
      }
    } catch (e) {
      console.error('Erreur chargement vues enregistrées:', e);
    }
  }, []);

  const handleSaveCurrentView = () => {
    const name = window.prompt('Nom de la vue à enregistrer :');
    if (!name) return;

    const newView = {
      name,
      statusFilter,
      priorityFilter,
      projectFilter,
      sortBy,
      groupBy,
    };

    const updated = [...savedViews.filter(v => v.name !== name), newView];
    setSavedViews(updated);
    try {
      localStorage.setItem('allTasksViewSavedViews', JSON.stringify(updated));
    } catch (e) {
      console.error('Erreur enregistrement vue:', e);
    }
  };

  const handleApplySavedView = (viewName) => {
    const view = savedViews.find(v => v.name === viewName);
    if (!view) return;

    setStatusFilter(view.statusFilter);
    setPriorityFilter(view.priorityFilter);
    setProjectFilter(view.projectFilter);
    setSortBy(view.sortBy);
    setGroupBy(view.groupBy);
  };

  if (loading) {
    return (
      <div className="all-tasks-loading">
        <LoadingSpinner />
        <p>Chargement de toutes les tâches...</p>
      </div>
    );
  }

  return (
    <div className="all-tasks-view">
      {/* En-tête */}
      <div className="page-header">
        <div className="header-left">
          {/* Bouton retour supprimé */}
          <div className="header-content">
            <h1>Toutes les Tâches</h1>
            <p>Vue globale de toutes les tâches de tous les projets</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="tasks-count">
            {allTasks.length} tâche(s) au total
          </span>
          <button
            className="btn btn-outline btn-sm"
            type="button"
            onClick={handleSaveCurrentView}
          >
            <i className="fas fa-save" />
            &nbsp;Enregistrer cette vue
          </button>
          {savedViews.length > 0 && (
            <select
              className="filter-select"
              onChange={(e) => {
                if (e.target.value) {
                  handleApplySavedView(e.target.value);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Charger une vue…
              </option>
              {savedViews.map((view) => (
                <option key={view.name} value={view.name}>
                  {view.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="task-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Terminées</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">En cours</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.delayed}</div>
          <div className="stat-label">En retard</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.todo}</div>
          <div className="stat-label">À faire</div>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="filters-section">
        <div className="filters-left">
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher dans toutes les tâches..."
          />
        </div>

        <div className="filters-right">
          <select 
            value={projectFilter} 
            onChange={(e) => setProjectFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les projets</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.nom}
              </option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="A_FAIRE">À faire</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINEE">Terminée</option>
            <option value="EN_RETARD">En retard</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes priorités</option>
            <option value="URGENTE">Urgente</option>
            <option value="HAUTE">Haute</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="BASSE">Basse</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="deadline">Échéance</option>
            <option value="priority">Priorité</option>
            <option value="status">Statut</option>
            <option value="title">Nom</option>
            <option value="project">Projet</option>
          </select>

          <select 
            value={groupBy} 
            onChange={(e) => setGroupBy(e.target.value)}
            className="filter-select"
          >
            <option value="none">Aucun groupement</option>
            <option value="project">Par projet</option>
            <option value="status">Par statut</option>
            <option value="priority">Par priorité</option>
          </select>
        </div>

          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="filter-select"
          >
            <option value="none">Sans regroupement</option>
            <option value="project">Par projet</option>
            <option value="status">Par statut</option>
            <option value="priority">Par priorité</option>
          </select>
      </div>

      {/* Résultats */}


      {/* Liste des tâches groupées */}
      <div className="tasks-container">
      {sortedTasks.length > 0 ? (
        <div className="grouped-tasks">
          {Object.entries(groupedTasks()).map(([groupName, tasks]) => (
            <div key={groupName} className="task-group">
              <div className="group-header">
                <h3>{groupName}</h3>
                <span className="group-count">{tasks.length} tâche(s)</span>
              </div>
              <div className="tasks-grid">
                {tasks.map(task => {
                  // Find the full project object by id or _id
                  let project = fullProjects.find(p => p.id === task.projectId || p._id === task.projectId);
                  // Fallback: try to match by name if id is missing (should not happen, but defensive)
                  if (!project && task.projectName) {
                    project = fullProjects.find(p => p.nom === task.projectName);
                  }
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onClick={() => handleTaskSelect(task)}
                      className="with-project"
                      data-project={task.projectName}
                      project={project}
                      onEdit={onEditTask}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state modern-empty">
          <div className="empty-icon">
            <i className="fas fa-tasks" />
          </div>
          <h3>Aucune tâche trouvée</h3>
          <p>
            {allTasks.length === 0
              ? "Aucune tâche n'a encore été créée pour vos projets."
              : "Aucune tâche ne correspond à vos critères actuels. Essayez d'élargir les filtres."}
          </p>
        </div>
      )}
      </div>
    </div>
  );
};

export default AllTasksView;