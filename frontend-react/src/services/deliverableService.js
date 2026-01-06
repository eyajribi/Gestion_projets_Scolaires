import api from "./api";

export const deliverableService = {
  // Récupérer la liste des fichiers joints d'un livrable (suppose endpoint /api/livrables/{livrableId}/fichiers)
  async getDeliverableFiles(livrableId) {
    try {
      const response = await api.get(`/api/livrables/${livrableId}/fichiers`);
      // On suppose que la réponse est un tableau d'objets { id, nom, url }
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('❌ Erreur getDeliverableFiles:', error);
      throw new Error("Erreur lors de la récupération des fichiers joints");
    }
  },
  async getProjectDeliverables(projectId) {
    try {
      const response = await api.get(`/api/livrables/projet/${projectId}`);
      console.log("📦 Livrables projet:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getProjectDeliverables:", error);
      throw new Error("Erreur lors de la récupération des livrables");
    }
  },

  async getGroupDeliverables(groupId) {
    try {
      const response = await api.get(`/api/livrables/groupe/${groupId}`);
      console.log("📦 Livrables groupe:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getGroupDeliverables:", error);
      throw new Error("Erreur lors de la récupération des livrables");
    }
  },

  async submitDeliverable(livrableId, file) {
    try {
      console.log("📤 Soumission livrable:", livrableId);
      
      const formData = new FormData();
      formData.append("fichier", file);
      
      const response = await api.post(`/api/livrables/${livrableId}/soumettre`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      
      console.log("✅ Livrable soumis:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur submitDeliverable:", error);
      throw new Error(error.message || "Erreur lors de la soumission du livrable");
    }
  },

  async evaluateDeliverable(livrableId, note, commentaires) {
    try {
      console.log("📊 Évaluation livrable:", { livrableId, note, commentaires });
      // Envoi en x-www-form-urlencoded pour Spring Boot @RequestParam
      const data = new URLSearchParams({ note, commentaires });
      const response = await api.put(
        `/api/livrables/${livrableId}/evaluer`,
        data,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
      console.log("✅ Livrable évalué:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur evaluateDeliverable:", error);
      throw new Error(error.message || "Erreur lors de l'évaluation du livrable");
    }
  },

  async getDelayedDeliverables() {
    try {
      const response = await api.get("/api/livrables/retard");
      console.log("⚠️ Livrables en retard:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getDelayedDeliverables:", error);
      throw new Error("Erreur lors de la récupération des livrables en retard");
    }
  },

  async getTeacherDeliverables() {
    try {
      const response = await api.get("/api/livrables/enseignant");
      console.log("📦 Livrables enseignant:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getTeacherDeliverables:", error);
      throw new Error("Erreur lors de la récupération des livrables");
    }
  },

  async setDeliverableInCorrection(livrableId) {
    try {
      console.log("✏️ Mise en correction:", livrableId);
      const response = await api.put(`/api/livrables/${livrableId}/correction`);
      console.log("✅ Livrable en correction:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur setDeliverableInCorrection:", error);
      throw new Error(error.message || "Erreur lors de la mise en correction");
    }
  },

  async rejectDeliverable(livrableId) {
    try {
      console.log("❌ Rejet livrable:", livrableId);
      const response = await api.put(`/api/livrables/${livrableId}/rejeter`);
      console.log("✅ Livrable rejeté:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur rejectDeliverable:", error);
      throw new Error(error.message || "Erreur lors du rejet du livrable");
    }
  }
};