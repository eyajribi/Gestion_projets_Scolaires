import api from "./api";

export const taskService = {
  async getStudentTasks(studentId) {
    try {
      const response = await api.get(`/api/taches/etudiant/${studentId}`);
      console.log("📝 Tâches étudiant:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getStudentTasks:", error);
      throw new Error("Erreur lors de la récupération des tâches");
    }
  },

  async getDelayedTasks() {
    try {
      const response = await api.get("/api/taches/retard");
      console.log("⚠️ Tâches en retard:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getDelayedTasks:", error);
      throw new Error("Erreur lors de la récupération des tâches en retard");
    }
  },
  async getTasksByProject(projectId) {
    try {
      const response = await api.get(`/api/taches/projet/${projectId}`);
      console.log("📁 Tâches par projet:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getTasksByProject:", error);
      throw new Error("Erreur lors de la récupération des tâches par projet");
    }
  },
  async getTasksTermineeByProject(projectId) {
    try {
      const response = await api.get(`/api/taches/projet/terminee/${projectId}`);
      console.log("📁 Tâches par projet:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getTasksByProject:", error);
      throw new Error("Erreur lors de la récupération des tâches par projet");
    }
  },

  async createTask(projectId, taskData) {
    try {
      // L'API attend la clé projetId (et non projectId)
      const response = await api.post(`/api/taches`, { ...taskData, projetId: projectId });
      console.log("✅ Tâche créée:", response);
      return response.data || response;
    } catch (error) {
      console.error("❌ Erreur createTask:", error);
      throw new Error(error.message || "Erreur lors de la création de la tâche");
    }
  },

  async assignTaskToStudent(taskId, studentId) {
    try {
      console.log("👤 Assignation tâche:", { taskId, studentId });
      const response = await api.put(`/api/taches/${taskId}/assigner/${studentId}`);
      console.log("✅ Tâche assignée:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur assignTaskToStudent:", error);
      throw new Error(error.message || "Erreur lors de l'assignation de la tâche");
    }
  },

  async updateTask(taskId, taskData) {
    try {
      console.log("📝 Mise à jour tâche:", { taskId, taskData });
      const response = await api.put(`/api/taches/${taskId}`, taskData);
      console.log("✅ Tâche mise à jour:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur updateTask:", error);
      throw new Error(error.message || "Erreur lors de la mise à jour de la tâche");
    }
  },

  async deleteTask(taskId) {
    try {
      console.log("🗑️ [deleteTask] Suppression tâche:", taskId);
      alert(`[deleteTask] Appel API suppression pour la tâche ID: ${taskId}`);
      const response = await api.delete(`/api/taches/${taskId}`);
      console.log("✅ Tâche supprimée:", response);
      alert(`[deleteTask] Réponse API: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      console.error("❌ Erreur deleteTask:", error);
      alert('[taskService.deleteTask] Erreur lors de la suppression: ' + (error.message || error));
      throw new Error(error.message || "Erreur lors de la suppression de la tâche");
    }
  }
};