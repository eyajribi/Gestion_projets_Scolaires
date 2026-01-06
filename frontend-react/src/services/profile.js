import api from "./api";

export const profileService = {
  async getProfile() {
    try {
      const response = await api.get("/auth/profile");
      console.log("📱 Profil récupéré:", response);
      return response.user || response;
    } catch (error) {
      console.error("❌ Erreur getProfile:", error);
      throw new Error("Erreur lors de la récupération du profil");
    }
  },

  async updateProfile(profileData) {
    try {
      const payload = {
        nom: profileData.nom,
        prenom: profileData.prenom,
        // Le backend n'a pas besoin de l'email en header si token valide,
        // mais on le passe quand même si l'interface l'envoie.
        email: profileData.email,
        numTel: profileData.numTel || '',
        nomFac: profileData.nomFac || '',
        nomDep: Array.isArray(profileData.nomDep)
          ? profileData.nomDep
          : profileData.nomDep || []
      };

      // Champ spécifique pour Enseignant
      if (typeof profileData.specialite !== 'undefined') {
        payload.specialite = profileData.specialite;
      }

      console.log('➡️ Payload updateProfile:', payload);
      console.log('➡️ Token présent (localStorage):', !!localStorage.getItem('eduproject_token'));

      const response = await api.put('/auth/profile/update', payload);
      console.log('⬅️ updateProfile response:', response);

      // Le backend renvoie response.user (selon votre implementation).
      const updatedUser = response.user || {
        id: response.id,
        nom: response.nom,
        prenom: response.prenom,
        email: response.email,
        role: response.role,
        estActif: response.estActif,
        numTel: response.numTel || payload.numTel,
        nomFac: response.nomFac || payload.nomFac,
        nomDep: response.nomDep || payload.nomDep,
        specialite: response.specialite || profileData.specialite,
        urlPhotoProfil: response.urlPhotoProfil
      };

      // Mettre à jour le localStorage et retourner l'utilisateur
      try {
        localStorage.setItem('eduproject_user', JSON.stringify(updatedUser));
      } catch (e) {
        console.warn('⚠️ Impossible de sauvegarder user dans localStorage', e);
      }

      return updatedUser;
    } catch (error) {
      console.error('❌ Erreur updateProfile:', error);
      // Remonter une erreur lisible au caller
      const message = (error && error.message) ? error.message : 'Erreur lors de la mise à jour du profil';
      throw new Error(message);
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      console.log("🔐 Changement de mot de passe");

      const response = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      console.log("✅ Mot de passe changé:", response);
      return response;
    } catch (error) {
      console.error("❌ Erreur changePassword:", error);
      throw new Error(
        error.message || "Erreur lors du changement de mot de passe"
      );
    }
  },

  async uploadAvatar(formData) {
    try {
      console.log("🖼️ Upload avatar / photo de profil");

      const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:8080";
      const response = await fetch(`${API_BASE_URL}/api/utilisateurs/me/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("eduproject_token")}`,
        },
        body: formData,
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        const backendMessage = data.message || data.error;
        console.error("⚠️ Erreur backend upload photo:", data);
        throw new Error(
          backendMessage ||
            `Erreur ${response.status}: Erreur lors du téléchargement de la photo de profil`
        );
      }

      console.log("✅ Photo de profil uploadée:", data);

      // Tenter de récupérer l'utilisateur mis à jour depuis la réponse (ReqRes)
      const storedRaw = localStorage.getItem("eduproject_user");
      let storedUser = null;
      try {
        storedUser = storedRaw ? JSON.parse(storedRaw) : null;
      } catch (e) {
        console.warn("⚠️ Impossible de parser eduproject_user depuis localStorage", e);
      }

      let candidateUser =
        data.user ||
        data.utilisateur ||
        (data.data && (data.data.user || data.data.utilisateur)) ||
        data;

      // S'assurer que urlPhotoProfil est bien propagé depuis la réponse ReqRes
      let urlPhotoProfilFromResponse =
        data.urlPhotoProfil ||
        (candidateUser && candidateUser.urlPhotoProfil) ||
        (storedUser && storedUser.urlPhotoProfil) ||
        null;

      // Normaliser l'URL : si elle n'est pas absolue, la préfixer avec API_BASE_URL
      if (
        urlPhotoProfilFromResponse &&
        !urlPhotoProfilFromResponse.startsWith("http://") &&
        !urlPhotoProfilFromResponse.startsWith("https://")
      ) {
        const cleaned = urlPhotoProfilFromResponse.replace(/^\/+/, "");
        urlPhotoProfilFromResponse = `${API_BASE_URL}/${cleaned}`;
      }

      if (candidateUser && urlPhotoProfilFromResponse) {
        candidateUser = { ...candidateUser, urlPhotoProfil: urlPhotoProfilFromResponse };
      }

      const updatedUser = storedUser
        ? {
            ...storedUser,
            ...candidateUser,
            urlPhotoProfil:
              urlPhotoProfilFromResponse || (storedUser && storedUser.urlPhotoProfil),
          }
        : {
            ...candidateUser,
            ...(urlPhotoProfilFromResponse && { urlPhotoProfil: urlPhotoProfilFromResponse }),
          };

      if (updatedUser) {
        try {
          localStorage.setItem("eduproject_user", JSON.stringify(updatedUser));
        } catch (e) {
          console.warn("⚠️ Impossible de sauvegarder user dans localStorage", e);
        }
      }

      return updatedUser;
    } catch (error) {
      console.error("❌ Erreur uploadAvatar:", error);
      throw new Error(
        error.message || "Erreur lors du téléchargement de la photo de profil"
      );
    }
  },

  async deleteAccount() {
    try {
      const response = await api.delete("/auth/account");
      return response;
    } catch (error) {
      throw new Error(
        error.message || "Erreur lors de la suppression du compte"
      );
    }
  },
};
