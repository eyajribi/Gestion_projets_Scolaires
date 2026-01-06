import api from "./api";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const normalizePhotoUrl = (raw) => {
  if (!raw) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const base = API_BASE_URL.replace(/\/+$/, "");
  const cleaned = raw.replace(/^\/+/, "");
  return `${base}/${cleaned}`;
};

const authService = {
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    if (!response || !response.token) {
      const err = new Error(response?.message || "Échec de la connexion");
      err.status = response?.statusCode || 401;
      throw err;
    }

    const user = response.user || {
      id: response.id,
      nom: response.nom,
      prenom: response.prenom,
      email: response.email,
      role: response.role,
    };

    // Normaliser l'URL de la photo de profil depuis la réponse ReqRes
    const urlPhotoProfil = normalizePhotoUrl(
      response.urlPhotoProfil ||
        (response.user && response.user.urlPhotoProfil) ||
        null
    );
    if (urlPhotoProfil) {
      user.urlPhotoProfil = urlPhotoProfil;
    }

    // Persist tokens and user
    try {
      localStorage.setItem("eduproject_token", response.token);
      if (response.refreshToken) {
        localStorage.setItem("eduproject_refresh_token", response.refreshToken);
      }
      localStorage.setItem("eduproject_user", JSON.stringify(user));
    } catch (e) {
      console.warn("Cannot persist auth data", e);
    }

    return { token: response.token, refreshToken: response.refreshToken, user };
  },

  async logout() {
    try {
      // Vérifier si le token existe avant de tenter la déconnexion
      const token = localStorage.getItem("eduproject_token");
      if (token) {
        await api.post("/auth/logout");
      }
    } catch (e) {
      console.warn("Erreur lors de la déconnexion backend:", e);
      // Ne pas throw l'erreur pour permettre le nettoyage local
    } finally {
      // Nettoyer le storage dans tous les cas
      localStorage.removeItem("eduproject_token");
      localStorage.removeItem("eduproject_refresh_token");
      localStorage.removeItem("eduproject_user");
    }
  },

  async getProfile() {
    try {
      const response = await api.get("/auth/profile");
      const profile = response.user || response;

      const urlPhotoProfil = normalizePhotoUrl(
        response.urlPhotoProfil || profile.urlPhotoProfil || null
      );
      if (urlPhotoProfil) {
        profile.urlPhotoProfil = urlPhotoProfil;
      }

      return profile;
    } catch (err) {
      const e = new Error(err.message || "Erreur getProfile");
      e.status = err.status || (err.body && err.body.statusCode) || 500;
      throw e;
    }
  },

  async verifyEmail(token) {
    const response = await api.post("/auth/verify-email", { token });
    return response;
  },

  async resendVerificationEmail(email) {
    const response = await api.post("/auth/resend-verification", { email });
    return response;
  },

  async register(userData) {
    const response = await api.post("/auth/register", userData);

    if (response.status === "success") {
      localStorage.setItem("pending_verification_email", userData.email);
    }

    return response;
  },

  async getProfileSafe() {
    return this.getProfile();
  },

  async refreshTokenIfAvailable() {
    const refreshToken = localStorage.getItem("eduproject_refresh_token");
    if (!refreshToken) {
      const e = new Error("No refresh token");
      e.status = 401;
      throw e;
    }

    try {
      const response = await api.post("/auth/refresh", { token: refreshToken });
      if (!response || !response.token) {
        const err = new Error(response?.message || "Refresh failed");
        err.status = response?.statusCode || 401;
        throw err;
      }

      localStorage.setItem("eduproject_token", response.token);
      if (response.refreshToken) {
        localStorage.setItem("eduproject_refresh_token", response.refreshToken);
      }
      return response.token;
    } catch (err) {
      const e = new Error(err.message || "Refresh failed");
      e.status = err.status || 401;
      throw e;
    }
  },

  getOAuth2Urls() {
    return {
      google: `${API_BASE_URL}/oauth2/authorization/google`,
      github: `${API_BASE_URL}/oauth2/authorization/github`,
    };
  },
  // ==================== DEMANDE RÉINITIALISATION MOT DE PASSE ====================
  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return response;
  },

  // ==================== RÉINITIALISER MOT DE PASSE ====================
  async resetPassword(token, newPassword) {
    console.log("Envoi de resetPassword avec:", { token, newPassword });
    try {
      const response = await api.post("/auth/reset-password", {
        token: token,
        newPassword: newPassword,
      });
      console.log("Réponse resetPassword:", response);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur resetPassword:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  // ==================== CHANGER MOT DE PASSE (UTILISATEUR CONNECTÉ) ====================
  async changePassword(currentPassword, newPassword) {
    const response = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response;
  },

  handleOAuth2Callback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      try {
        localStorage.setItem("eduproject_token", token);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        return token;
      } catch (error) {
        console.error("Error handling OAuth2 callback:", error);
        return null;
      }
    }
    return null;
  },
};
export default authService;
