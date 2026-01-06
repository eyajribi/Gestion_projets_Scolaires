import api from "./api";

export const userService = {
  async getStudents() {
    try {
      const response = await api.get("/api/utilisateurs/etudiants");
      console.log("🎓 Étudiants récupérés:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getStudents:", error);
      throw new Error("Erreur lors de la récupération des étudiants");
    }
  },

  async getTeachers() {
    try {
      const response = await api.get("/api/utilisateurs/enseignants");
      console.log("👨‍🏫 Enseignants récupérés:", response);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("❌ Erreur getTeachers:", error);
      throw new Error("Erreur lors de la récupération des enseignants");
    }
  },

  async getUserById(id) {
    try {
      const response = await api.get(`/api/utilisateurs/${id}`);
      console.log("👤 Utilisateur récupéré:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur getUserById:", error);
      throw new Error("Erreur lors de la récupération de l'utilisateur");
    }
  }
};