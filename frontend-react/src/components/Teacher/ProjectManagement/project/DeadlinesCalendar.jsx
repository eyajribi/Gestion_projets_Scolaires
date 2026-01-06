import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../../../UI/LoadingSpinner';
import SearchFilter from '../../../Common/SearchFilter';
import '../ProjectDashboard.css';
import './DeadlinesCalendar.css';
import { deliverableService } from '../../../../services/deliverableService';

const DeadlinesCalendar = ({ projects, getProjectTasks, onBack }) => {
  const [itemsByDate, setItemsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // task, deliverable, all

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Charger toutes les tâches par projet
        const taskPromises = projects.map(async (project) => {
          const tasks = await getProjectTasks(project.id);
          return tasks.map((t) => ({
            id: `task-${t.id}`,
            type: 'task',
            rawType: 'TÂCHE',
            title: t.titre,
            description: t.description,
            date: t.dateEcheance,
            projectId: project.id,
            projectName: project.nom,
            priority: t.priorite,
            status: t.statut,
          }));
        });

        const tasksPerProject = await Promise.all(taskPromises);
        const allTasks = tasksPerProject.flat();

        // 2. Charger tous les livrables enseignant
        let allDeliverables = [];
        try {
          const deliverables = await deliverableService.getTeacherDeliverables();
          allDeliverables = (deliverables || []).map((d) => ({
            id: `deliverable-${d.id}`,
            type: 'deliverable',
            rawType: 'LIVRABLE',
            title: d.nom,
            description: d.description,
            date: d.dateEcheance,
            projectId: d.projet?.id,
            projectName: d.projet?.nom || 'Projet inconnu',
            status: d.statut,
          }));
        } catch (e) {
          console.error('Erreur chargement livrables pour le calendrier:', e);
        }

        const allItems = [...allTasks, ...allDeliverables].filter((item) => item.date);

        // 3. Regrouper par jour (YYYY-MM-DD)
        const map = {};
        allItems.forEach((item) => {
          const dateKey = new Date(item.date).toISOString().split('T')[0];

          if (!map[dateKey]) {
            map[dateKey] = [];
          }
          map[dateKey].push(item);
        });

        // Trier les dates et les éléments à l'intérieur
        Object.keys(map).forEach((key) => {
          map[key].sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === 'task' ? -1 : 1;
            }
            return (a.title || '').localeCompare(b.title || '');
          });
        });

        setItemsByDate(map);
      } catch (error) {
        console.error('Erreur chargement calendrier des échéances:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projects && projects.length > 0) {
      loadData();
    } else {
      setItemsByDate({});
      setLoading(false);
    }
  }, [projects, getProjectTasks]);

  const dates = Object.keys(itemsByDate).sort((a, b) => new Date(a) - new Date(b));

  const filterItems = (items) => {
    return items.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject =
        projectFilter === 'all' || String(item.projectId) === String(projectFilter);

      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'task' && item.type === 'task') ||
        (typeFilter === 'deliverable' && item.type === 'deliverable');

      return matchesSearch && matchesProject && matchesType;
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Chargement du calendrier des échéances...</p>
      </div>
    );
  }

  return (
    <div className="project-dashboard deadlines-calendar">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Calendrier des Échéances</h1>
          <p>Visualisez toutes les dates importantes de vos projets (tâches et livrables)</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-left">
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher une tâche ou un livrable..."
          />
        </div>
        <div className="filters-right">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les projets</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.nom}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tâches & livrables</option>
            <option value="task">Tâches uniquement</option>
            <option value="deliverable">Livrables uniquement</option>
          </select>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <h3>Aucune échéance trouvée</h3>
          <p>Créez des tâches ou des livrables pour voir apparaître les dates ici.</p>
        </div>
      ) : (
        <div className="deadlines-timeline">
          {dates.map((dateKey) => {
            const dayItems = filterItems(itemsByDate[dateKey] || []);
            if (dayItems.length === 0) {
              return null;
            }

            const dateObj = new Date(dateKey);
            const formattedDate = dateObj.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div key={dateKey} className="deadline-day">
                <div className="day-header">
                  <div className="day-date">{formattedDate}</div>
                  <div className="day-count">{dayItems.length} élément(s)</div>
                </div>
                <div className="day-items">
                  {dayItems.map((item) => (
                    <div
                      key={item.id}
                      className={`deadline-item ${item.type === 'task' ? 'task' : 'deliverable'}`}
                    >
                      <div className="item-type-badge">
                        {item.rawType}
                      </div>
                      <div className="item-main">
                        <div className="item-title">{item.title}</div>
                        <div className="item-meta">
                          <span className="item-project">
                            <i className="fas fa-folder"></i> {item.projectName}
                          </span>
                          {item.priority && (
                            <span className={`item-priority priority-${item.priority.toLowerCase()}`}>
                              {item.priority}
                            </span>
                          )}
                          {item.status && (
                            <span className="item-status">{item.status}</span>
                          )}
                        </div>
                        {item.description && (
                          <div className="item-description">{item.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeadlinesCalendar;
