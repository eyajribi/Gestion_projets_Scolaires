import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import ProjectList from "./project/ProjectList";
import ProjectForm from "./project/ProjectForm";
import ProjectCreationWizard from "./project/ProjectCreationWizard";
import ProjectDetails from "./project/ProjectDetails";
import TaskForm from "./tache/TaskForm";
import DeliverableManagement from "./livrable/DeliverableManagement";
import GroupManagement from "./group/GroupManagement";
import StatisticsPanel from "./dashboard/StatisticsPanel";
import ProjectDashboard from "./dashboard/ProjectDashboard";
import AllTasksView from "./project/AllTasksView";
import TaskList from "./tache/TaskList";
import KanbanTasksView from "./tache/KanbanTasksView";
import DeadlinesCalendar from "./project/DeadlinesCalendar";
import LoadingSpinner from "../../UI/LoadingSpinner";
import Sidebar from "../../Layout/Sidebar";
import "./TeacherProjectManagement.css";

let projectService, taskService, groupService;

import { useLocation, useNavigate } from "react-router-dom";

const TeacherProjectManagement = ({ activeView: propActiveView }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Vue active interne : prop ou état de navigation précédent, sinon tableau de bord
  const [activeView, setActiveView] = useState(
    propActiveView || (location.state && location.state.activeView) || "dashboard"
  );
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showKanban, setShowKanban] = useState(false);
  const [projectTasks, setProjectTasks] = useState({}); // Stocker les tâches par projet
  const [projectGroupsCount, setProjectGroupsCount] = useState({}); // Nombre de groupes par projet
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    const loadServices = async () => {
      try {
        const services = await import("../../../services/projectService");
        projectService = services.projectService;

        const taskServices = await import("../../../services/taskService");
        taskService = taskServices.taskService;
      } catch (error) {
        console.error("Erreur chargement des services:", error);
      }
    };

    loadServices();
  }, []);

  useEffect(() => {
    loadProjects();
  }, []);

  // Si la prop activeView change (navigation par route), on synchronise la vue interne
  useEffect(() => {
    if (propActiveView) {
      setActiveView(propActiveView);
    }
  }, [propActiveView]);

  const handleNavigate = (view) => {
    // Map view to route
    const viewToRoute = {
      dashboard: "/teacher-dashboard",
      projects: "/projects",
      'all-tasks': "/tasks",
      deliverables: "/deliverables",
      groups: "/groups",
      statistics: "/statistics",
      'deadlines-calendar': "/deadlines-calendar",
      profile: "/profile",
      messaging: "/messaging"
    };
    if (viewToRoute[view]) {
      navigate(viewToRoute[view], { state: { activeView: view } });
      setActiveView(view);
    } else {
      setActiveView(view);
    }
    // Si on quitte la vue "groups", on recalcule les associations groupes/projets
    if (activeView === "groups" && view !== "groups") {
      try {
        loadProjectsGroups(projects);
      } catch (e) {
        console.error("Erreur lors du recalcul des groupes par projet:", e);
      }
    }
  };

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      5000
    );
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      if (!projectService) {
        const services = await import("../../../services/projectService");
        projectService = services.projectService;
      }
      if (!groupService) {
        const services = await import("../../../services/groupService");
        groupService = services.groupService;
      }

      const projectsData = await projectService.getTeacherProjects();
      // Enrichir chaque projet avec ses groupes associés
      const enrichedProjects = await Promise.all(
        projectsData.map(async (project) => {
          let groupes = [];
          try {
            // Certains backends renvoient déjà les groupes, sinon on enrichit
            if (Array.isArray(project.groupes) && project.groupes.length > 0 && project.groupes[0].nom) {
              groupes = project.groupes;
            } else {
              // On récupère tous les groupes et on filtre ceux liés à ce projet
              const allGroups = await groupService.getGroups();
              groupes = allGroups.filter(g => Array.isArray(g.projets) && g.projets.some(p => (p.id || p._id) === (project.id || project._id)));
            }
          } catch (e) {
            groupes = [];
          }
          return { ...project, groupes };
        })
      );
      setProjects(enrichedProjects);

      // Charger aussi les projets archivés de l'enseignant
      try {
        const archived = await projectService.getArchivedProjects();
        setArchivedProjects(archived);
      } catch (error) {
        console.error("Erreur chargement projets archivés:", error);
      }

      // Charger les tâches pour chaque projet
      await loadAllProjectsTasks(enrichedProjects);

      // Charger le nombre de groupes associés à chaque projet
      await loadProjectsGroups(enrichedProjects);
    } catch (error) {
      console.error("Erreur chargement projets:", error);
      showNotification(
        error.message || "Erreur lors du chargement des projets",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadProjectTasks = async (projectId) => {
    try {
      if (!taskService) {
        const services = await import("../../../services/taskService");
        taskService = services.taskService;
      }

      const tasks = await taskService.getTasksByProject(projectId);

      // Enrichir les assignés avec les infos des membres du projet
      // On cherche le projet courant dans la liste des projets
      const project = projects.find(p => (p.id || p._id) === projectId);
      let membres = [];
      if (project && Array.isArray(project.groupes)) {
        project.groupes.forEach(groupe => {
          if (Array.isArray(groupe.membres)) {
            membres = membres.concat(groupe.membres);
          }
        });
      }

      // Pour chaque tâche, enrichir assignesA
      const enrichedTasks = tasks.map(task => {
        if (!Array.isArray(task.assignesA)) return task;
        return {
          ...task,
          assignesA: task.assignesA.map(assignee => {
            // Si déjà enrichi (nom/prenom présents), on garde
            if (assignee && assignee.nom && assignee.prenom) return assignee;
            // Sinon, on cherche dans les membres
            const found = membres.find(m => (m.id || m._id) === (assignee.id || assignee.userId || assignee._id));
            return found ? { ...found } : assignee;
          })
        };
      });
      return enrichedTasks;
    } catch (error) {
      console.error(`Erreur chargement tâches projet ${projectId}:`, error);
      return [];
    }
  };

  const loadProjectsGroups = useCallback(async (projectsList) => {
    try {
      if (!groupService) {
        const services = await import("../../../services/groupService");
        groupService = services.groupService;
      }

      const groups = await groupService.getGroups();
      const counts = {};

      const groupProjectsPromises = groups.map((group) => {
        const groupId = group.id || group._id;
        return groupService
          .getGroupProjects(groupId)
          .then((groupProjects) => ({ groupId, groupProjects }))
          .catch((error) => {
            console.error(
              `Erreur chargement projets pour le groupe ${groupId}:`,
              error
            );
            return { groupId, groupProjects: [] };
          });
      });

      const results = await Promise.all(groupProjectsPromises);

      results.forEach(({ groupProjects }) => {
        (Array.isArray(groupProjects) ? groupProjects : groupProjects?.data || [])
          .forEach((project) => {
            const projectId = project.id || project._id;
            if (!projectId) return;
            counts[projectId] = (counts[projectId] || 0) + 1;
          });
      });

      // Ne garder que les projets présents dans la liste en cours
      const validProjectIds = new Set(
        (projectsList || []).map((p) => p.id || p._id)
      );
      const filteredCounts = {};
      Object.entries(counts).forEach(([projectId, count]) => {
        if (validProjectIds.has(projectId)) {
          filteredCounts[projectId] = count;
        }
      });

      setProjectGroupsCount(filteredCounts);
    } catch (error) {
      console.error(
        "Erreur lors du chargement du nombre de groupes par projet:",
        error
      );
    }
  }, []);

  const loadAllProjectsTasks = async (projectsList) => {
    try {
      const tasksPromises = projectsList.map((project) =>
        loadProjectTasks(project.id).then((tasks) => ({
          projectId: project.id,
          tasks,
        }))
      );

      const tasksResults = await Promise.all(tasksPromises);

      const tasksMap = {};
      tasksResults.forEach(({ projectId, tasks }) => {
        tasksMap[projectId] = tasks;
      });

      setProjectTasks(tasksMap);
    } catch (error) {
      console.error("Erreur chargement des tâches:", error);
    }
  };

  const refreshProjectTasks = async (projectId) => {
    const tasks = await loadProjectTasks(projectId);
    setProjectTasks((prev) => ({
      ...prev,
      [projectId]: tasks,
    }));
    return tasks;
  };

  const handleCreateProject = async (projectData, groupIds = []) => {
    try {
      if (!projectService) {
        const services = await import("../../../services/projectService");
        projectService = services.projectService;
      }

      const newProject = await projectService.createProject(projectData);
      setProjects((prev) => [...prev, newProject]);

      // Initialiser les tâches vides pour le nouveau projet
      setProjectTasks((prev) => ({
        ...prev,
        [newProject.id]: [],
      }));

      // Associer les groupes sélectionnés si fournis
      if (groupIds && groupIds.length > 0) {
        try {
          const assignPromises = groupIds.map((groupId) =>
            projectService
              .assignGroupToProject(newProject.id, groupId)
              .catch((error) => {
                console.error("Erreur assignation groupe au projet:", error);
              })
          );
          await Promise.all(assignPromises);

          // Recharger le projet complet pour récupérer les groupes associés
          try {
            const fullProjectResponse = await projectService.getProjectById(
              newProject.id
            );
            const fullProject = Array.isArray(fullProjectResponse)
              ? fullProjectResponse
              : fullProjectResponse.data || fullProjectResponse;

            setProjects((prev) =>
              prev.map((p) => (p.id === newProject.id ? fullProject : p))
            );

            // Mettre à jour le compteur local du nombre de groupes pour ce projet
            setProjectGroupsCount((prev) => ({
              ...prev,
              [newProject.id]: groupIds.length,
            }));
          } catch (error) {
            console.error(
              "Erreur lors du rechargement du projet après assignation des groupes:",
              error
            );
          }
        } catch (error) {
          console.error("Erreur globale assignation groupes:", error);
        }
      }

      handleNavigate("projects");
      if (groupIds && groupIds.length > 0) {
        showNotification("Projet créé et groupes assignés avec succès");
      } else {
        showNotification("Projet créé avec succès");
      }
      return true;
    } catch (error) {
      showNotification(
        error.message || "Erreur lors de la création du projet",
        "error"
      );
      return false;
    }
  };

    
  // Assigner un groupe ou membre à une tâche
  const handleAssignTask = async (taskId, assignees) => {
    try {
      if (!taskService) {
        const services = await import("../../../services/taskService");
        taskService = services.taskService;
      }
      // On envoie la liste complète des assignés (groupes/membres)
      await taskService.updateTask(taskId, { assignesA: assignees });
      // Mettre à jour localement
      setProjectTasks((prev) => {
        const projectId = selectedProject?.id;
        if (!projectId) return prev;
        return {
          ...prev,
          [projectId]: (prev[projectId] || []).map((t) =>
            t.id === taskId ? { ...t, assignesA: assignees } : t
          ),
        };
      });
      showNotification("Tâche assignée avec succès");
    } catch (error) {
      showNotification(error.message || "Erreur lors de l'assignation", "error");
    }
  };

  const handleUpdateProject = async (projectId, projectData) => {
    try {
      if (!projectService) {
        const services = await import("../../../services/projectService");
        projectService = services.projectService;
      }

      const updatedProject = await projectService.updateProject(
        projectId,
        projectData
      );
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );

      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProject);
      }

      showNotification("Projet mis à jour avec succès");
      setTimeout(() => {
        handleNavigate("projects");
      }, 1000);
      return true;
    } catch (error) {
      showNotification(
        error.message || "Erreur lors de la mise à jour du projet",
        "error"
      );
      return false;
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      if (!projectService) {
        const services = await import("../../../services/projectService");
        projectService = services.projectService;
      }

      const isArchived = archivedProjects.some(
        (p) => (p.id || p._id) === projectId
      );

      if (isArchived) {
        // Restauration du projet
        await projectService.restoreProject(projectId);

        setArchivedProjects((prevArchived) => {
          const projectToRestore = prevArchived.find(
            (p) => (p.id || p._id) === projectId
          );

          if (projectToRestore) {
            setProjects((prevActive) => [
              ...prevActive,
              { ...projectToRestore, archive: false, dateArchivage: null },
            ]);
          }

          return prevArchived.filter((p) => (p.id || p._id) !== projectId);
        });

        if (selectedProject && (selectedProject.id || selectedProject._id) === projectId) {
          setSelectedProject(null);
          handleNavigate("projects");
        }

        showNotification("Projet restauré avec succès");
        return true;
      }

      // Archivage logique du projet
      await projectService.archiveProject(projectId);

      // Correction : supprimer le projet archivé de la liste des projets actifs
      setProjects((prev) => prev.filter((p) => (p.id || p._id) !== projectId));
      // Supprimer aussi les tâches du projet archivé du cache local
      setProjectTasks((prev) => {
        const newTasks = { ...prev };
        delete newTasks[projectId];
        return newTasks;
      });

      if (selectedProject && (selectedProject.id || selectedProject._id) === projectId) {
        setSelectedProject(null);
        handleNavigate("projects");
      }

      showNotification("Projet archivé avec succès");
      return true;
    } catch (error) {
      const isArchived = archivedProjects.some(
        (p) => (p.id || p._id) === projectId
      );
      showNotification(
        error.message ||
          (isArchived
            ? "Erreur lors de la restauration du projet"
            : "Erreur lors de l'archivage du projet"),
        "error"
      );
      return false;
    }
  };

  const handleAddTask = async (projectId, taskData) => {
    try {
      if (!taskService) {
        const services = await import("../../../services/taskService");
        taskService = services.taskService;
      }

      await taskService.createTask(projectId, taskData);

      // Recharge la liste complète des tâches du projet depuis l'API
      const tasks = await taskService.getTasksByProject(projectId);
      setProjectTasks((prev) => ({
        ...prev,
        [projectId]: tasks,
      }));

      // Mettre à jour aussi la propriété taches du projet sélectionné pour le bandeau
      setSelectedProject((prev) => {
        if (!prev || prev.id !== projectId) return prev;
        return { ...prev, taches: tasks };
      });

      showNotification("Tâche ajoutée avec succès");
      handleNavigate("project-tasks");
      // Rafraîchir la liste après navigation pour garantir l'affichage à jour
      setTimeout(() => {
        refreshProjectTasks(projectId);
      }, 100);
      return true;
    } catch (error) {
      showNotification(
        error.message || "Erreur lors de l'ajout de la tâche",
        "error"
      );
      return false;
    }
  };

  const handleUpdateTaskStatus = async (projectId, taskId, newStatus) => {
    try {
      if (!taskService) {
        const services = await import("../../../services/taskService");
        taskService = services.taskService;
      }

      await projectService.updateTaskStatus(taskId, newStatus);

      // Mettre à jour la tâche dans le state
      setProjectTasks((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map((task) =>
          task.id === taskId ? { ...task, statut: newStatus } : task
        ),
      }));

      showNotification("Statut de la tâche mis à jour");
    } catch (error) {
      showNotification(
        error.message || "Erreur lors de la mise à jour du statut",
        "error"
      );
    }
  };

  // Obtenir les tâches d'un projet
  const getProjectTasks = (projectId) => {
    return projectTasks[projectId] || [];
  };

  // Obtenir les statistiques des tâches pour un projet
  const getProjectTaskStats = (projectId) => {
    const tasks = getProjectTasks(projectId);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.statut === "TERMINEE").length;
    const inProgress = tasks.filter((t) => t.statut === "EN_COURS").length;
    const delayed = tasks.filter((t) => t.statut === "EN_RETARD").length;
    const todo = tasks.filter((t) => t.statut === "A_FAIRE").length;

    return { total, completed, inProgress, delayed, todo };
  };

  const handleShowKanban = () => setShowKanban(true);
  const handleHideKanban = () => setShowKanban(false);

  const handleDeleteTask = async (taskId) => {
      try {
        if (!taskService) {
          const services = await import("../../../services/taskService");
          taskService = services.taskService;
        }
        const projectId = selectedProject?.id;
        await taskService.deleteTask(taskId);
        // Mise à jour locale des tâches
        setProjectTasks((prev) => {
          if (!projectId) return prev;
          return {
            ...prev,
            [projectId]: (prev[projectId] || []).filter((t) => t.id !== taskId),
          };
        });
        // Mettre à jour aussi la propriété taches du projet sélectionné pour le bandeau
        setSelectedProject((prev) => {
          if (!prev || prev.id !== projectId) return prev;
          return { ...prev, taches: (prev.taches || []).filter((t) => t.id !== taskId) };
        });
        showNotification("Tâche supprimée avec succès");
      } catch (error) {
        showNotification(error.message || "Erreur lors de la suppression de la tâche", "error");
      }
    };

  // Handler pour l'édition d'une tâche (déplacé avant le switch)
  const handleEditTask = async (taskId, updatedValues) => {
    try {
      console.log('[handleEditTask] called', { taskId, updatedValues });
      if (!taskService) {
        const services = await import("../../../services/taskService");
        taskService = services.taskService;
      }
      const projectId = selectedProject?.id;
      // Patch: format date fields for backend
      const formatDateTime = (date) => {
        if (!date) return date;
        // If already has T, assume correct
        if (typeof date === 'string' && date.includes('T')) return date;
        // If only date, add time
        return new Date(date).toISOString().slice(0, 19);
      };
      const valuesToSend = { ...updatedValues };
      if (valuesToSend.dateDebut) valuesToSend.dateDebut = formatDateTime(valuesToSend.dateDebut);
      if (valuesToSend.dateEcheance) valuesToSend.dateEcheance = formatDateTime(valuesToSend.dateEcheance);
      // Sanitize assignesA: only send id, nom, prenom
      if (Array.isArray(valuesToSend.assignesA)) {
        valuesToSend.assignesA = valuesToSend.assignesA.map(a => ({
          id: a.id || a.value?.userId || a.value?.id,
          nom: a.nom,
          prenom: a.prenom
        }));
      }
      let updatedTask = null;
      try {
        updatedTask = await taskService.updateTask(taskId, valuesToSend);
        console.log('[handleEditTask] updateTask response:', updatedTask);
      } catch (e) {
        console.warn('[handleEditTask] updateTask error, fallback to form values', e);
        updatedTask = null;
      }
      // Mettre à jour les tâches du projet
      setProjectTasks((prev) => {
        if (!projectId) return prev;
        const newTasks = (prev[projectId] || []).map((t) =>
          t.id === taskId ? { ...t, ...updatedValues, ...(updatedTask || {}) } : t
        );
        console.log('[handleEditTask] setProjectTasks', newTasks);
        return {
          ...prev,
          [projectId]: newTasks,
        };
      });
      // Mettre à jour le projet sélectionné
      setSelectedProject((prev) => {
        if (!prev || prev.id !== projectId) return prev;
        const newTaches = (prev.taches || []).map((t) =>
          t.id === taskId ? { ...t, ...updatedValues, ...(updatedTask || {}) } : t
        );
        return {
          ...prev,
          taches: newTaches,
        };
      });
      showNotification("Tâche modifiée avec succès");
    } catch (error) {
      console.error('[handleEditTask] error', error);
      showNotification(error.message || "Erreur lors de la modification de la tâche", "error");
    }
  };

  const renderActiveView = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <LoadingSpinner />
          <p>Chargement des données...</p>
        </div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return (
          <ProjectDashboard
            projects={projects}
            getProjectTasks={getProjectTasks}
            getProjectTaskStats={getProjectTaskStats}
            onProjectSelect={(project) => {
              setSelectedProject(project);
              handleNavigate("project-details");
            }}
            onNavigate={handleNavigate}
            projectGroupsCount={projectGroupsCount}
          />
        );


      case "projects":
        // Injecter les vraies tâches dans chaque projet pour ProjectList/ProjectCard
        const projectsWithTasks = projects.map((p) => ({
          ...p,
          taches: projectTasks[p.id] || [],
        }));
        const archivedProjectsWithTasks = archivedProjects.map((p) => ({
          ...p,
          taches: projectTasks[p.id] || [],
        }));
        return (
          <ProjectList
            projects={projectsWithTasks}
            archivedProjects={archivedProjectsWithTasks}
            projectGroupsCount={projectGroupsCount}
            onProjectSelect={(project) => {
              setSelectedProject(project);
              handleNavigate("project-tasks");
            }}
            onEditProject={(project) => {
              setSelectedProject(project);
              handleNavigate("edit-project");
            }}
            onDeleteProject={handleDeleteProject}
            onAddTask={(project) => {
              setSelectedProject(project);
              handleNavigate("add-task");
            }}
            onAssignGroups={(project) => {
              if (!project) return;
              setSelectedProject(project);
              handleNavigate("groups");
            }}
            onCreateProject={(initialProject) => {
              if (initialProject) {
                setSelectedProject(initialProject);
              } else {
                setSelectedProject(null);
              }
              handleNavigate("create-project");
            }}
            onKanbanView={(project) => {
              setSelectedProject(project);
              setShowKanban(true);
              setActiveView("project-tasks");
            }}
          />
        );



      case "project-tasks":
        if (showKanban) {
          return (
            <KanbanTasksView
              tasks={getProjectTasks(selectedProject?.id) || []}
              projectId={selectedProject?.id}
              project={selectedProject}
              onBack={handleHideKanban}
              onAssign={handleAssignTask}
            />
          );
        }
        return (
          <TaskList
            tasks={getProjectTasks(selectedProject?.id) || []}
            onUpdateStatus={handleUpdateTaskStatus}
            onAddTask={() => handleNavigate("add-task")}
            projectId={selectedProject?.id}
            project={selectedProject}
            onShowKanban={handleShowKanban}
            onAssign={handleAssignTask}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
          />
        );

      case "create-project":
        return (
          <ProjectCreationWizard
            onSubmit={handleCreateProject}
            existingProjects={projects}
            initialProject={selectedProject}
            onCancel={() => handleNavigate("projects")}
          />
        );

      case "edit-project":
        return (
          <ProjectForm
            project={selectedProject}
            onSubmit={(data) => handleUpdateProject(selectedProject.id, data)}
            onCancel={() => handleNavigate("projects")}
            mode="edit"
          />
        );

      case "project-details":
        return (
          <ProjectDetails
            project={selectedProject}
            tasks={getProjectTasks(selectedProject?.id)}
            taskStats={getProjectTaskStats(selectedProject?.id)}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddTask={() => handleNavigate("add-task")}
            onEditProject={() => handleNavigate("edit-project")}
            onDeleteProject={handleDeleteProject}
            onRefreshTasks={() => refreshProjectTasks(selectedProject?.id)}
            onBack={() => handleNavigate("projects")}
            onEditTask={handleEditTask}
          />
        );


      case "add-task":
        // Utiliser un composant wrapper pour gérer les hooks
        function AddTaskWrapper({ project, onSubmit, onCancel }) {
          const [enrichedProject, setEnrichedProject] = React.useState(project);
          const [loadingGroups, setLoadingGroups] = React.useState(false);

          React.useEffect(() => {
            const fetchGroupsAndMembers = async () => {
              if (!project) return;
              if (project.groupes && project.groupes.length > 0 && project.groupes[0].membres) {
                setEnrichedProject(project);
                return;
              }
              setLoadingGroups(true);
              try {
                if (!groupService) {
                  const services = await import("../../../services/groupService");
                  groupService = services.groupService;
                }
                const allGroups = await groupService.getGroups();
                const projectId = project.id || project._id;
                const projectGroups = [];
                for (const group of allGroups) {
                  const groupProjects = await groupService.getGroupProjects(group.id || group._id);
                  const isInProject = (Array.isArray(groupProjects) ? groupProjects : groupProjects.data || []).some(
                    (p) => (p.id || p._id) === projectId
                  );
                  if (isInProject) {
                    const membres = await groupService.getGroupStudents(group.id || group._id);
                    projectGroups.push({ ...group, membres });
                  }
                }
                setEnrichedProject({ ...project, groupes: projectGroups });
              } catch (e) {
                setEnrichedProject(project);
              } finally {
                setLoadingGroups(false);
              }
            };
            fetchGroupsAndMembers();
          }, [project]);

          if (loadingGroups || !enrichedProject) {
            return (
              <div style={{ padding: 40, textAlign: "center" }}>
                <LoadingSpinner />
                <p>Chargement des groupes et membres du projet...</p>
              </div>
            );
          }
          return (
            <TaskForm
              project={enrichedProject}
              onSubmit={(taskData) => onSubmit(enrichedProject.id, taskData)}
              onCancel={onCancel}
            />
          );
        }
        return (
          <AddTaskWrapper
            project={selectedProject}
            onSubmit={handleAddTask}
            onCancel={() => handleNavigate("project-details")}
          />
        );

      case "deliverables":
        return (
          <DeliverableManagement
            projects={projects}
            getProjectTasks={getProjectTasks}
            onBack={() => handleNavigate("dashboard")}
          />
        );

      case "groups":
        return (
          <GroupManagement
            projects={projects}
            fromProjectId={selectedProject?.id}
            onBack={() => handleNavigate("dashboard")}
          />
        );

      case "statistics":
        return (
          <StatisticsPanel
            projects={projects}
            getProjectTasks={getProjectTasks}
            getProjectTaskStats={getProjectTaskStats}
            onBack={() => handleNavigate("dashboard")}
          />
        );

      case "all-tasks": 
        return (
          <AllTasksView
            projects={projects}
            getProjectTasks={getProjectTasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onTaskSelect={(task) => {
              // Trouver le projet de la tâche et naviguer vers ses détails
              const taskProject = projects.find((p) => p.id === task.projectId);
              if (taskProject) {
                setSelectedProject(taskProject);
                handleNavigate("project-details");
              }
            }}
            onEditTask={handleEditTask}
            onBack={() => handleNavigate("dashboard")}
          />
        );

      case "deadlines-calendar":
        return (
          <DeadlinesCalendar
            projects={projects}
            getProjectTasks={getProjectTasks}
            onBack={() => handleNavigate("dashboard")}
          />
        );

      default:
        return <div>Vue non trouvée</div>;
    }
  }; // FIN DE renderActiveView

  // Ajout du layout global avec Sidebar
  // On récupère les props nécessaires pour la Sidebar
  // On utilise le même layout que TeacherDashboard
  const getTotalTasksCount = () => 0;
  const getDelayedTasksCount = () => 0;

  return (
    <div className="teacher-dashboard" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        getTotalTasksCount={getTotalTasksCount}
        getDelayedTasksCount={getDelayedTasksCount}
        user={user}
        onLogout={logout}
      />
      <div className="teacher-dashboard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Notification */}
        {notification.show && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}
        <main className="dashboard-main" style={{ flex: 1 }}>
          <div className="dashboard-container">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherProjectManagement;
