import api from "./api";

// Service de notifications FRONT
// ⚠️ IMPORTANT : les endpoints utilisés ici sont à implémenter côté back-end.
// Vous pouvez adapter les URLs / payloads selon votre API réelle.

export const notificationService = {
  /**
   * Notifier les étudiants d'un ou plusieurs groupes qu'un nouveau projet a été créé.
   *
   * @param {Object} project - Projet créé (au minimum id, nom, dates).
   * @param {Array<string|number>} groupIds - Identifiants des groupes concernés.
   * @returns {Promise<any>} Réponse de l'API (à définir côté back).
   */
  async notifyProjectCreated(project, groupIds) {
    // TODO BACK-END:
    //  - Créer un endpoint du type POST /api/notifications/projets/creation
    //  - Ce endpoint devra :
    //      * récupérer les étudiants appartenant aux groupes fournis
    //      * générer / envoyer les notifications (email, in-app, ...)
    //      * enregistrer la notification si nécessaire
    try {
      const payload = {
        projetId: project.id || project._id,
        titre: project.nom,
        dateDebut: project.dateDebut,
        dateFin: project.dateFin,
        groupes: groupIds,
      };

      console.log("📣 Notification projet créé (payload théorique):", payload);

      // Appel API théorique (décommentez et ajustez quand le back sera prêt)
      // const response = await api.post("/api/notifications/projets/creation", payload);
      // return response;

      // Pour l'instant, on renvoie une valeur simulée
      return { success: true, simulated: true };
    } catch (error) {
      console.error("❌ Erreur notifyProjectCreated (front):", error);
      throw new Error(
        error.message || "Erreur lors de la préparation de la notification projet créé"
      );
    }
  },

  /**
   * Notifier les étudiants à propos d'une échéance de projet (rappel).
   *
   * @param {Object} project - Projet concerné.
   * @param {Date|string} dueDate - Date de l'échéance (livrable, fin de projet...).
   * @param {Array<string|number>} groupIds - Groupes concernés.
   */
  async notifyProjectDeadline(project, dueDate, groupIds) {
    // TODO BACK-END:
    //  - Créer un endpoint pour les rappels d'échéances
    //    ex: POST /api/notifications/projets/echeance
    try {
      const payload = {
        projetId: project.id || project._id,
        titre: project.nom,
        dateEcheance: dueDate,
        groupes: groupIds,
      };

      console.log("⏰ Notification échéance projet (payload théorique):", payload);

      // const response = await api.post("/api/notifications/projets/echeance", payload);
      // return response;

      return { success: true, simulated: true };
    } catch (error) {
      console.error("❌ Erreur notifyProjectDeadline (front):", error);
      throw new Error(
        error.message || "Erreur lors de la préparation de la notification d'échéance"
      );
    }
  },

  /**
   * Envoyer une notification générique (message libre) à une liste d'étudiants.
   *
   * @param {Array<string|number>} studentIds - Identifiants des étudiants.
   * @param {string} title - Titre de la notification.
   * @param {string} message - Contenu principal.
   */
  async sendCustomNotification(studentIds, title, message) {
    // TODO BACK-END:
    //  - Créer un endpoint générique de notification
    //    ex: POST /api/notifications/custom
    try {
      const payload = {
        destinataires: studentIds,
        titre: title,
        message,
      };

      console.log("✉️ Notification personnalisée (payload théorique):", payload);

      // const response = await api.post("/api/notifications/custom", payload);
      // return response;

      return { success: true, simulated: true };
    } catch (error) {
      console.error("❌ Erreur sendCustomNotification (front):", error);
      throw new Error(
        error.message || "Erreur lors de la préparation de la notification personnalisée"
      );
    }
  },
};
