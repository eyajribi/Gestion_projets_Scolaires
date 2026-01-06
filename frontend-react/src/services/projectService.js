import api from "./api";

export const projectService = {
  async getProjectById(id) {
    try {
      const response = await api.get(`/api/projets/${id}`);
      console.log("📋 Projet détaillé:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur getProjectById:", error);
      throw new Error("Erreur lors de la récupération du projet");
    }
  },
  async getTeacherProjects() {
    try {
      const response = await api.get("/api/projets/enseignant");
      console.log("📁 Projets enseignant récupérés:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getTeacherProjects:", error);
      throw new Error("Erreur lors de la récupération des projets de l'enseignant");
    }
  },

  async createProject(projectData) {
    try {
      console.log("🆕 Création projet:", projectData);
      
      const payload = {
        nom: projectData.nom,
        description: projectData.description,
        dateDebut: projectData.dateDebut,
        dateFin: projectData.dateFin,
        statut: projectData.statut || "PLANIFIE"
      };

      const response = await api.post("/api/projets", payload);
      console.log("✅ Projet créé:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur createProject:", error);
      throw new Error(error.message || "Erreur lors de la création du projet");
    }
  },

  async updateProject(id, projectData) {
    try {
      console.log("📝 Mise à jour projet:", { id, projectData });
      
      const payload = {
        nom: projectData.nom,
        description: projectData.description,
        dateDebut: projectData.dateDebut,
        dateFin: projectData.dateFin,
        statut: projectData.statut
      };

      const response = await api.put(`/api/projets/${id}`, payload);
      console.log("✅ Projet mis à jour:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur updateProject:", error);
      throw new Error(error.message || "Erreur lors de la mise à jour du projet");
    }
  },

async deleteProject(id) {
  try {
    console.log("🗑️ Suppression projet:", id);
    const response = await api.delete(`/api/projets/${id}`);
    console.log("✅ Projet supprimé, statut:", response.status);
    return { success: true, id }; 
  } catch (error) {
    console.error("❌ Erreur deleteProject:", error);
    throw new Error(error.response?.data?.error || error.message || "Erreur lors de la suppression du projet");
  }
},
  async addTask(projectId, taskData) {
    try {
      console.log("➕ Ajout tâche:", { projectId, taskData });
      
      const payload = {
        titre: taskData.titre,
        description: taskData.description,
        priorite: taskData.priorite || "MOYENNE",
        dateDebut: taskData.dateDebut,
        dateEcheance: taskData.dateEcheance,
        assignesA: taskData.assignesA || []
      };

      const response = await api.post(`/api/projets/${projectId}/taches`, payload);
      console.log("✅ Tâche ajoutée:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur addTask:", error);
      throw new Error(error.message || "Erreur lors de l'ajout de la tâche");
    }
  },

  async updateTaskStatus(taskId, status) {
    try {
      const safeStatus = status && status !== 'undefined' ? status : 'A_FAIRE';
      console.log("🔄 Mise à jour statut tâche:", { taskId, status: safeStatus });
      const response = await api.put(`/api/taches/${taskId}/statut?statut=${safeStatus}`);
      console.log("✅ Statut tâche mis à jour:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur updateTaskStatus:", error);
      throw new Error(error.message || "Erreur lors de la mise à jour de la tâche");
    }
  },

  async getDelayedProjects() {
    try {
      const response = await api.get("/api/projets/retard");
      console.log("⚠️ Projets en retard:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getDelayedProjects:", error);
      throw new Error("Erreur lors de la récupération des projets en retard");
    }
  },

  async getArchivedProjects() {
    try {
      const response = await api.get("/api/projets/enseignant/archives");
      console.log("📁 Projets archivés enseignant:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getArchivedProjects:", error);
      throw new Error("Erreur lors de la récupération des projets archivés");
    }
  },

  async assignGroupToProject(projectId, groupeId) {
    try {
      console.log("👥 Assignation groupe:", { projectId, groupeId });
      const response = await api.post(`/api/projets/${projectId}/groupes/${groupeId}`);
      console.log("✅ Groupe assigné:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur assignGroupToProject:", error);
      throw new Error(error.message || "Erreur lors de l'assignation du groupe");
    }
  },

  async getProjectTasks(projectId) {
    try {
      const response = await api.get(`/api/projets/${projectId}/taches`);
      console.log("📝 Tâches projet:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getProjectTasks:", error);
      throw new Error("Erreur lors de la récupération des tâches");
    }
  },

  async updateProjectStatus(projectId, status) {
    try {
      console.log("🔄 Mise à jour statut projet:", { projectId, status });
      // Correspond à @PutMapping("/{projetId}/statut") sur /api/projets
      const response = await api.put(`/api/projets/${projectId}/statut?statut=${status}`);
      console.log("✅ Statut projet mis à jour:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur updateProjectStatus:", error);
      throw new Error(error.message || "Erreur lors de la mise à jour du statut");
    }
  },

  async archiveProject(projectId) {
    try {
      console.log("📦 Archivage projet:", { projectId });
      const response = await api.put(`/api/projets/${projectId}/archiver`);
      console.log("✅ Projet archivé:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur archiveProject:", error);
      throw new Error(error.message || "Erreur lors de l'archivage du projet");
    }
  },

  async restoreProject(projectId) {
    try {
      console.log("📦 Restauration projet:", { projectId });
      const response = await api.put(`/api/projets/${projectId}/restaurer`);
      console.log("✅ Projet restauré:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur restoreProject:", error);
      throw new Error(error.message || "Erreur lors de la restauration du projet");
    }
  }
};