import api from "./api";

export const groupService = {
  async getGroups() {
    try {
      const response = await api.get("/api/groupes");
      console.log("👥 Groupes récupérés:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getAllGroups:", error);
      throw new Error("Erreur lors de la récupération des groupes");
    }
  },

  async getGroupById(id) {
    try {
      const response = await api.get(`/api/groupes/${id}`);
      console.log("📋 Groupe détaillé:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur getGroupById:", error);
      throw new Error("Erreur lors de la récupération du groupe");
    }
  },

  async createGroup(groupData) {
    try {
      console.log("🆕 Création groupe:", groupData);
      
      const payload = {
        nom: groupData.nom,
        description: groupData.description,
        pourcentageAvancement: groupData.pourcentageAvancement || 0.0
      };

      const response = await api.post("/api/groupes", payload);
      console.log("✅ Groupe créé:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur createGroup:", error);
      throw new Error(error.message || "Erreur lors de la création du groupe");
    }
  },

  async updateGroup(id, groupData) {
    try {
      console.log("📝 Mise à jour groupe:", { id, groupData });
      
      // Send all fields present in groupData, including archive
      const payload = {
        nom: groupData.nom,
        description: groupData.description,
        pourcentageAvancement: groupData.pourcentageAvancement,
        archive: groupData.archive
      };

      const response = await api.put(`/api/groupes/${id}`, payload);
      console.log("✅ Groupe mis à jour:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur updateGroup:", error);
      throw new Error(error.message || "Erreur lors de la mise à jour du groupe");
    }
  },

  async deleteGroup(id) {
    try {
      console.log("🗑️ Suppression groupe:", id);
      const response = await api.delete(`/api/groupes/${id}`);
      console.log("✅ Groupe supprimé, statut:", response.status);
      return { success: true, id };
    } catch (error) {
      console.error("❌ Erreur deleteGroup:", error);
      throw new Error(error.response?.data?.error || error.message || "Erreur lors de la suppression du groupe");
    }
  },

  async addStudentToGroup(groupId, studentId) {
    try {
      console.log("➕ Ajout étudiant au groupe:", { groupId, studentId });
      const response = await api.post(`/api/groupes/${groupId}/etudiants/${studentId}`);
      console.log("✅ Étudiant ajouté au groupe:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur addStudentToGroup:", error);
      throw new Error(error.message || "Erreur lors de l'ajout de l'étudiant au groupe");
    }
  },

  async removeStudentFromGroup(groupId, studentId) {
    try {
      console.log("➖ Retrait étudiant du groupe:", { groupId, studentId });
      const response = await api.delete(`/api/groupes/${groupId}/etudiants/${studentId}`);
      console.log("✅ Étudiant retiré du groupe:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur removeStudentFromGroup:", error);
      throw new Error(error.message || "Erreur lors du retrait de l'étudiant du groupe");
    }
  },

  async addProjectToGroup(groupId, projectId) {
    try {
      console.log("📁 Ajout projet au groupe:", { groupId, projectId });
      const response = await api.post(`/api/groupes/${groupId}/projets/${projectId}`);
      console.log("✅ Projet ajouté au groupe:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur addProjectToGroup:", error);
      throw new Error(error.message || "Erreur lors de l'ajout du projet au groupe");
    }
  },

  async getGroupStudents(groupId) {
    try {
      const response = await api.get(`/api/groupes/${groupId}/etudiants`);
      console.log("🎓 Étudiants du groupe:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getGroupStudents:", error);
      throw new Error("Erreur lors de la récupération des étudiants du groupe");
    }
  },

  async getGroupProjects(groupId) {
    try {
      const response = await api.get(`/api/groupes/${groupId}/projets`);
      console.log("📁 Projets du groupe:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getGroupProjects:", error);
      throw new Error("Erreur lors de la récupération des projets du groupe");
    }
  },

  async calculateGroupProgress(groupId) {
    try {
      console.log("📊 Calcul avancement groupe:", groupId);
      const response = await api.post(`/api/groupes/${groupId}/calcul-avancement`);
      console.log("✅ Avancement calculé:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur calculateGroupProgress:", error);
      throw new Error(error.message || "Erreur lors du calcul de l'avancement du groupe");
    }
  }
};