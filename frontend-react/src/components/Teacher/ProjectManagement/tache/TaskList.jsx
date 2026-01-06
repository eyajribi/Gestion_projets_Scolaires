import React, { useState } from 'react';
import TaskCard from './TaskCard';
import SearchFilter from '../../../Common/SearchFilter';
import Pagination from '../../../Common/Pagination';
import '../project/AllTasksView.css';

const TaskList = ({ tasks, onUpdateStatus, onAddTask, projectId, project, onShowKanban, onAssign, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

  const filteredTasks = (tasks || []).filter((task) => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      task.titre.toLowerCase().includes(lowerSearch) ||
      (task.description || '').toLowerCase().includes(lowerSearch);

    const matchesStatus = statusFilter === 'all' || task.statut === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priorite === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.dateEcheance) - new Date(b.dateEcheance);
      case 'priority':
        return (a.priorite || '').localeCompare(b.priorite || '');
      case 'status':
        return (a.statut || '').localeCompare(b.statut || '');
      case 'title':
        return (a.titre || '').localeCompare(b.titre || '');
      default:
        return 0;
    }
  });

  const totalTasks = sortedTasks.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + pageSize);

  // Correction : on passe aussi projectId pour correspondre à la signature attendue
  const handleStatusChange = (taskId, newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(projectId, taskId, newStatus);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };


  // Project summary banner (calcul dynamique de l'avancement)
  const renderProjectBanner = () => {
    if (!project) return null;
    const start = project.dateDebut ? new Date(project.dateDebut).toLocaleDateString('fr-FR') : '';
    const end = project.dateFin ? new Date(project.dateFin).toLocaleDateString('fr-FR') : '';
    const statusMap = {
      PLANIFIE: { color: '#06b6d4', label: 'Planifié' },
      ACTIF: { color: '#10b981', label: 'En cours' },
      TERMINE: { color: '#3b82f6', label: 'Terminé' },
      EN_PAUSE: { color: '#f59e0b', label: 'En pause' },
      ANNULE: { color: '#ef4444', label: 'Annulé' },
      EN_COURS: { color: '#10b981', label: 'En cours' },
    };
    const status = statusMap[project.statut] || { color: '#6b7280', label: project.statut };
    const taches = Array.isArray(project.taches) ? project.taches : [];
    const total = taches.length;
    const done = taches.filter(t => t.statut === 'TERMINEE').length;
    const late = taches.filter(t => t.statut === 'EN_RETARD').length;
    // Calcul dynamique de l'avancement :
    let progress = 0;
    if (total === 0) {
      progress = 0;
    } else {
      // Moyenne sur toutes les tâches (0% si pas de valeur ni terminée, 100% si terminée, sinon la valeur numérique)
      const sum = taches.reduce((acc, t) => {
        if (typeof t.pourcentageAvancement === 'number' && !isNaN(t.pourcentageAvancement)) {
          return acc + Math.max(0, Math.min(100, t.pourcentageAvancement));
        } else if (t.statut === 'TERMINEE') {
          return acc + 100;
        } else {
          return acc + 0;
        }
      }, 0);
      progress = Math.round(sum / total);
    }

    return (
      <div className="project-banner sticky-banner" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc',
        borderRadius: 16,
        boxShadow: '0 2px 8px #0001',
        padding: '1.2rem 2rem',
        marginBottom: 24,
        gap: 32,
        flexWrap: 'wrap',
      }}>
        <div className="project-banner-main" style={{ flex: 1, minWidth: 0 }}>
          <div className="project-title-row" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className="project-title" style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginRight: 8, wordBreak: 'break-word' }}>{project.nom}</span>
            <span className="project-status-badge" style={{ background: status.color + '22', color: status.color, border: `1px solid ${status.color}55`, borderRadius: 8, fontWeight: 600, fontSize: 15, padding: '0.2em 0.9em', marginLeft: 0 }}>{status.label}</span>
          </div>
          <div className="project-dates" style={{ color: '#64748b', fontWeight: 500, fontSize: 15, marginBottom: 10 }}>{start} — {end}</div>
          <div className="project-stats-row" style={{ display: 'flex', gap: 18, fontSize: 15, fontWeight: 600, color: '#334155', marginBottom: 0 }}>
            <span className="project-stat"><b>{total}</b> tâche(s)</span>
            <span className="project-stat done" style={{ color: '#10b981' }}><b>{done}</b> terminée(s)</span>
            <span className="project-stat late" style={{ color: '#ef4444' }}><b>{late}</b> en retard</span>
          </div>
        </div>
        <div className="project-progress" style={{ minWidth: 180, textAlign: 'center', marginLeft: 24 }}>
          <div className="progress-label" style={{ fontWeight: 600, color: '#64748b', fontSize: 15, marginBottom: 2 }}>Avancement</div>
          <div className="progress-value" style={{ fontWeight: 700, color: progress === 0 ? '#64748b' : '#10b981', fontSize: 22, marginBottom: 6 }}>{progress}%</div>
          <div className="progress-bar-outer" style={{ background: '#e5e7eb', borderRadius: 8, height: 10, width: '100%', minWidth: 120, margin: '0 auto', overflow: 'hidden' }}>
            <div className="progress-bar-inner" style={{ height: 10, borderRadius: 8, background: progress === 0 ? '#cbd5e1' : '#10b981', width: `${progress}%`, transition: 'width 0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="all-tasks-view advanced-tasklist-ui modernized-tasklist" style={{
      background: '#f6f8fa',
      borderRadius: 24,
      boxShadow: '0 6px 32px #0001',
      padding: '2.2rem 2.5rem',
      maxWidth: 1300,
      margin: '32px auto',
      minHeight: 400,
    }}>
      {renderProjectBanner()}

      {/* Top bar: Filtres + Add Task button + Kanban button */}
      <div className="filters-section sticky-filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: '1rem 1.2rem', marginBottom: 18 }}>
        <div className="filters-left" style={{ flex: 1 }}>
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher une tâche..."
          />
        </div>
        <div className="filters-right" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Boutons de vue */}
          <div className="view-toggle-btns" style={{ display: 'flex', gap: 4, marginRight: 10 }}>
            <button
              type="button"
              className={`btn btn-outline modern-btn ${viewMode === 'grid' ? 'active' : ''}`}
              style={{ borderRadius: 8, border: '1.5px solid #64748b', color: viewMode === 'grid' ? '#fff' : '#64748b', background: viewMode === 'grid' ? '#64748b' : '#f8fafc', fontWeight: 700, padding: '0.4rem 0.9rem', fontSize: 15 }}
              onClick={() => setViewMode('grid')}
              title="Vue Grille"
            >
              <i className="fas fa-th-large" style={{ marginRight: 6 }} /> Grille
            </button>
            <button
              type="button"
              className={`btn btn-outline modern-btn ${viewMode === 'list' ? 'active' : ''}`}
              style={{ borderRadius: 8, border: '1.5px solid #64748b', color: viewMode === 'list' ? '#fff' : '#64748b', background: viewMode === 'list' ? '#64748b' : '#f8fafc', fontWeight: 700, padding: '0.4rem 0.9rem', fontSize: 15 }}
              onClick={() => setViewMode('list')}
              title="Vue Liste"
            >
              <i className="fas fa-list" style={{ marginRight: 6 }} /> Liste
            </button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
            style={{ borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: 15 }}
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
            style={{ borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: 15 }}
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
            style={{ borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: 15 }}
          >
            <option value="deadline">Échéance</option>
            <option value="priority">Priorité</option>
            <option value="status">Statut</option>
            <option value="title">Nom</option>
          </select>
          <button
            className="btn btn-outline kanban-btn modern-btn"
            style={{ borderRadius: 8, fontWeight: 700, color: '#10b981', border: '1.5px solid #10b981', background: '#f8fafc', padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', fontSize: 15, transition: 'background 0.2s, color 0.2s' }}
            onClick={() => (typeof onShowKanban === 'function' ? onShowKanban() : null)}
            title="Vue Kanban"
            onMouseOver={e => e.currentTarget.style.background = '#d1fae5'}
            onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
          >
            <i className="fas fa-columns" style={{ marginRight: 8, fontSize: 17 }} />
            Vue Kanban
          </button>
          <button className="btn btn-primary add-task-btn modern-btn" style={{ borderRadius: 8, fontWeight: 700, fontSize: 15, padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px #10b98122', background: '#10b981', border: 'none', color: '#fff', transition: 'background 0.2s' }} onClick={onAddTask}
            onMouseOver={e => e.currentTarget.style.background = '#059669'}
            onMouseOut={e => e.currentTarget.style.background = '#10b981'}
          >
            <i className="fas fa-plus" style={{ marginRight: 8, fontSize: 17 }} />
            Ajouter une tâche
          </button>
        </div>
      </div>



      <div className="tasks-container" style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {sortedTasks.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="tasks-list advanced-tasks-list" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
                width: '100%',
                justifyContent: 'center',
              }}>
                {paginatedTasks.map((task) => {
                  console.log('[TaskList] rendering TaskCard', { taskId: task.id, onEditType: typeof onEdit });
                  return (
                    <div className="task-list-row" key={task.id} style={{
                      background: '#fff',
                      borderRadius: 16,
                      boxShadow: '0 2px 12px #0001',
                      padding: '1.2rem 2.2rem',
                      transition: 'box-shadow 0.2s',
                      border: '1.5px solid #e5e7eb',
                      minWidth: 320,
                      maxWidth: 540,
                      margin: '0 auto',
                      width: '100%',
                    }}>
                      <TaskCard
                        task={task}
                        onStatusChange={handleStatusChange}
                        project={project}
                        onAssign={onAssign}
                        onDelete={onDelete}
                        onEdit={onEdit}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="tasks-list list-mode-tasks-list" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                width: '100%',
              }}>
                {paginatedTasks.map((task) => (
                  <div className="task-list-row list-row" key={task.id} style={{
                    background: '#fff',
                    borderRadius: 10,
                    boxShadow: '0 1px 4px #0001',
                    padding: '0.8rem 1.2rem',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                  }}>
                    <TaskCard
                      task={task}
                      onStatusChange={handleStatusChange}
                      project={project}
                      onAssign={onAssign}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      viewMode="list"
                    />
                  </div>
                ))}
              </div>
            )}
            <Pagination
              totalItems={totalTasks}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        ) : (
          <div className="empty-state modern-empty">
            <div className="empty-icon">
              <i className="fas fa-tasks" />
            </div>
            <h3>Aucune tâche trouvée</h3>
            <p>
              {tasks && tasks.length === 0
                ? 'Commencez par créer votre première tâche'
                : 'Aucune tâche ne correspond à vos critères de recherche'}
            </p>
            {tasks && tasks.length === 0 && (
              <button className="btn btn-primary" onClick={onAddTask}>
                <i className="fas fa-plus" />
                Créer une tâche
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
