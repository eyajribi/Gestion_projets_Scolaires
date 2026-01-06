import React, { useState, useEffect } from 'react';

import StatisticsCard from './StatisticsCard';
import ProjectCard from '../project/ProjectCard';
import QuickActions from '../QuickActions';
import ActivityFeed from '../project/ActivityFeed';
import LoadingSpinner from '../../../UI/LoadingSpinner';
import QuickProjectFilters from './QuickProjectFilters';
import ProjectGroupTable from './ProjectGroupTable';
import '../ProjectDashboard.css';

const ProjectDashboard = ({
  projects = [],
  getProjectTasks,
  getProjectTaskStats,
  onProjectSelect,
  onNavigate,
  projectGroupsCount,
}) => {
  // État pour les filtres rapides
  const [quickFilters, setQuickFilters] = useState({ all: true, notEvaluated: false, groupId: '', projectId: '' });
  const [groups, setGroups] = useState([]);
    // Charger les groupes au montage (pour les sélecteurs)
    useEffect(() => {
      let mounted = true;
      async function fetchGroups() {
        try {
          const { groupService } = await import('../../../../services/groupService');
          const allGroups = await groupService.getGroups();
          if (mounted) setGroups(Array.isArray(allGroups) ? allGroups : []);
        } catch (e) {
          setGroups([]);
        }
      }
      fetchGroups();
      return () => { mounted = false; };
    }, []);
    // Générer les lignes du tableau Groupe/Projet/État/Dernière modif.
    const getTableRows = () => {
      // Construction des lignes à partir des projets et groupes associés
      let rows = [];
      projects.forEach((project) => {
        // Pour chaque groupe lié au projet
        (project.groupes || []).forEach((groupe) => {
          // État d'évaluation : on prend la note du projet pour ce groupe (si dispo)
          let note = 0;
          let noteRaw = null;
          if (Array.isArray(project.evaluations)) {
            const evalForGroup = project.evaluations.find(e => (e.groupeId || e.groupId) === (groupe.id || groupe._id));
            if (evalForGroup && typeof evalForGroup.note === 'number') {
              noteRaw = evalForGroup.note;
              note = Math.round(evalForGroup.note / 4); // 0-20 → 0-5 étoiles
            }
          }
          // Date de dernière modification : projet ou groupe
          const lastModified = project.dateModification || groupe.dateModification || project.dateFin || project.dateDebut;
          rows.push({
            groupId: groupe.id || groupe._id,
            groupName: groupe.nom,
            membersCount: (groupe.etudiants?.length || groupe.membres?.length || 0),
            projectId: project.id || project._id,
            projectName: project.nom,
            note,
            noteRaw,
            lastModified,
          });
        });
      });
      // Filtres rapides
      if (quickFilters.groupId) rows = rows.filter(r => r.groupId === quickFilters.groupId);
      if (quickFilters.projectId) rows = rows.filter(r => r.projectId === quickFilters.projectId);
      if (quickFilters.notEvaluated) rows = rows.filter(r => r.note === 0);
      // "Tous les projets" = pas de filtre restrictif
      return rows;
    };
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    delayedProjects: 0,
    pendingDeliverables: 0,
    completedTasks: 0,
    totalStudents: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [delayedItems, setDelayedItems] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [projects]);

  const handleRefreshActivities = () => {
    loadDashboardData();
  };

  const handleShowAllActivities = () => {
    setShowAllActivities(true);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [{ userService }, { deliverableService }] = await Promise.all([
        import('../../../../services/userService'),
        import('../../../../services/deliverableService'),
      ]);

      const [students, teacherDeliverables] = await Promise.all([
        userService.getStudents(),
        deliverableService.getTeacherDeliverables(),
      ]);

      const projectList = Array.isArray(projects) ? projects : [];

      const allTasks = projectList.flatMap((project) => {
        if (typeof getProjectTasks === 'function') {
          return getProjectTasks(project.id) || [];
        }
        return project.taches || [];
      });

      const completedTasks = allTasks.filter((t) => t.statut === 'TERMINEE').length;
      const delayedTasks = allTasks.filter((t) => t.statut === 'EN_RETARD').length;

      // Livrables en attente (tous sauf corrigés ou rejetés)
      const pendingDeliverablesList = (teacherDeliverables || []).filter((d) =>
        ['A_SOUMETTRE', 'SOUMIS', 'EN_CORRECTION', 'EN_RETARD'].includes(d.statut)
      );

      const delayedProjectIds = new Set(
        allTasks
          .filter((t) => t.statut === 'EN_RETARD')
          .map((t) => t.projetId || t.projectId || t.projet?.id)
          .filter(Boolean)
      );

      const totalProjects = projectList.length;
      const activeProjects = projectList.filter((p) => p.statut === 'EN_COURS').length;

      setStats({
        totalProjects,
        activeProjects,
        delayedProjects: delayedProjectIds.size,
        pendingDeliverables: pendingDeliverablesList.length,
        completedTasks,
        totalStudents: students.length,
      });

      // Projets récents (5 derniers)
      setRecentProjects(projectList.slice(0, 5));

      // Éléments en retard (tâches et livrables en retard)
      const delayedTaskItems = allTasks
        .filter((t) => t.statut === 'EN_RETARD')
        .map((t) => ({
          type: 'task',
          titre: t.titre,
          nom: t.titre,
        }));

      const delayedDeliverableItems = delayedDeliverables.map((d) => ({
        type: 'deliverable',
        titre: d.nom,
        nom: d.nom,
      }));

      setDelayedItems([...delayedTaskItems, ...delayedDeliverableItems]);

      // Activités récentes basées sur les vraies tâches et livrables
      const activitiesData = [];

      allTasks.forEach((t) => {
        const baseUser =
          Array.isArray(t.assignesA) && t.assignesA.length > 0
            ? `${t.assignesA[0].prenom || ''} ${t.assignesA[0].nom || ''}`.trim() || 'Étudiant'
            : 'Étudiant';

        if (t.statut === 'TERMINEE' && t.dateFin) {
          activitiesData.push({
            id: `task-completed-${t.id}`,
            type: 'task_completed',
            message: `Tâche "${t.titre}" marquée comme terminée`,
            time: t.dateFin,
            user: baseUser,
            project: t.projectName || t.projet?.nom || '',
            priority: 'medium',
          });
        } else if (t.statut === 'EN_RETARD') {
          activitiesData.push({
            id: `task-delayed-${t.id}`,
            type: 'task_created',
            message: `Tâche "${t.titre}" en retard`,
            time: t.dateEcheance || t.dateFin || t.dateDebut || new Date().toISOString(),
            user: baseUser,
            project: t.projectName || t.projet?.nom || '',
            priority: 'high',
          });
        }
      });

      (teacherDeliverables || []).forEach((d) => {
        if (d.dateSoumission) {
          activitiesData.push({
            id: `deliverable-submitted-${d.id}`,
            type: 'deliverable_submitted',
            message: `Livrable "${d.nom}" soumis`,
            time: d.dateSoumission,
            user: d.groupe?.nom || 'Groupe',
            project: d.projet?.nom || '',
            priority: 'medium',
          });
        }

        if (d.note != null) {
          activitiesData.push({
            id: `deliverable-evaluated-${d.id}`,
            type: 'deliverable_evaluated',
            message: `Livrable "${d.nom}" évalué avec ${d.note}/20`,
            time: d.dateSoumission || d.dateEcheance || new Date().toISOString(),
            user: 'Vous',
            project: d.projet?.nom || '',
            priority: 'high',
          });
        }
      });

      const sortedActivities = activitiesData
        .filter((a) => a.time)
        .sort((a, b) => new Date(b.time) - new Date(a.time));

      setActivities(showAllActivities ? sortedActivities : sortedActivities.slice(0, 10));

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  // Handler pour les actions rapides
  const handleQuickAction = (action) => {
    if (action === 'review-deliverables') {
      onNavigate && onNavigate('deliverables');
    } else if (action === 'manage-groups') {
      onNavigate && onNavigate('groups');
    } else if (action === 'create-project') {
      onNavigate && onNavigate('create-project');
    } else if (action === 'generate-reports') {
      onNavigate && onNavigate('reports');
    }
  };

  return (
    <div className="project-dashboard">
      {/* Le tableau principal avec filtres est désormais dans la colonne gauche */}
      {/* Alertes prioritaires */}
      {stats.delayedProjects > 0 && (
        <div className="alert alert-warning">
          <div className="alert-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="alert-content">
            <strong>{stats.delayedProjects} projet(s) en retard</strong>
            <p>Des actions sont nécessaires pour respecter les échéances.</p>
          </div>
          <button className="btn btn-sm" onClick={() => onNavigate('projects')}>
            Voir les détails
          </button>
        </div>
      )}

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <StatisticsCard
          title="Projets Totaux"
          value={stats.totalProjects}
          icon="fas fa-folder"
          color="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatisticsCard
          title="Projets Actifs"
          value={stats.activeProjects}
          icon="fas fa-play-circle"
          color="success"
        />
        {/* Carte 'En Retard' supprimée */}
        <StatisticsCard
          title="Livrables en Attente"
          value={stats.pendingDeliverables}
          icon="fas fa-inbox"
          color="info"
        />
        <StatisticsCard
          title="Tâches Terminées"
          value={stats.completedTasks}
          icon="fas fa-check-circle"
          color="success"
        />
        <StatisticsCard
          title="Étudiants"
          value={stats.totalStudents}
          icon="fas fa-users"
          color="secondary"
        />
      </div>

      <div className="dashboard-content">
        {/* Colonne gauche */}
        <div className="content-left">
          {/* Tableau principal avec filtres rapides */}
          <div className="dashboard-card">
            <div className="card-header" style={{display:'flex',alignItems:'center',gap:8,justifyContent:'flex-start'}}>
              <h3 style={{margin:0,display:'flex',alignItems:'center',gap:8}}>
                <span style={{color:'#2563eb',fontSize:'1.3em',display:'flex',alignItems:'center'}}>
                  <i className="fas fa-layer-group"></i>
                </span>
                Projets & Groupes
              </h3>
            </div>
            <div className="card-body">
              <QuickProjectFilters
                groups={groups}
                projects={projects}
                onFilterChange={setQuickFilters}
                initialFilters={quickFilters}
              />
              <ProjectGroupTable rows={getTableRows()} />
            </div>
          </div>

          {/* Actions rapides */}
          <QuickActions onAction={handleQuickAction} />
        </div>

        {/* Colonne droite */}
        <div className="content-right">
          {/* Éléments en retard */}
          {delayedItems.length > 0 && (
            <div className="dashboard-card alert-card">
              <div className="card-header">
                <h3 className="text-warning">
                  <i className="fas fa-exclamation-circle"></i>
                  Attention Requise
                </h3>
              </div>
              <div className="card-body">
                <div className="delayed-items">
                  {delayedItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="delayed-item">
                      <div className="item-type">
                        {item.type === 'project' && <i className="fas fa-folder text-warning"></i>}
                        {item.type === 'task' && <i className="fas fa-tasks text-danger"></i>}
                        {item.type === 'deliverable' && <i className="fas fa-file-upload text-info"></i>}
                      </div>
                      <div className="item-content">
                        <div className="item-title">{item.nom || item.titre}</div>
                        <div className="item-meta">
                          {item.type === 'project' && 'Projet en retard'}
                          {item.type === 'task' && 'Tâche en retard'}
                          {item.type === 'deliverable' && 'Livrable en attente'}
                        </div>
                      </div>
                      <div className="item-action">
                        <button
                          className="btn btn-sm btn-outline"
                          type="button"
                          onClick={() => {
                            if (item.type === 'project') {
                              onNavigate('projects');
                            } else if (item.type === 'task') {
                              onNavigate('all-tasks');
                            } else if (item.type === 'deliverable') {
                              onNavigate('deliverables');
                            }
                          }}
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {delayedItems.length > 5 && (
                  <div className="text-center mt-3">
                    <button className="btn btn-text">
                      Voir les {delayedItems.length - 5} éléments supplémentaires
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flux d'activité */}
          <ActivityFeed
            activities={activities}
            onRefresh={handleRefreshActivities}
            onShowAll={handleShowAllActivities}
            showAll={showAllActivities}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;