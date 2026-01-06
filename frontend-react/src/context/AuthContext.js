import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Créer le contexte d'abord
const AuthContext = createContext();

// Hook personnalisé
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("eduproject_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  // Fonction pour importer authService dynamiquement
  const getAuthService = useCallback(() => {
    return require("../services/auth").default;
  }, []);

  const doLogout = useCallback(async () => {
    const authService = getAuthService();
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Erreur lors de la déconnexion backend (ignorée)", e);
    } finally {
      localStorage.removeItem("eduproject_token");
      localStorage.removeItem("eduproject_refresh_token");
      localStorage.removeItem("eduproject_user");
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }, [getAuthService]);

  const handleOAuth2Callback = useCallback(
    async (token) => {
      if (!token) return;
      setLoading(true);
      const authService = getAuthService();
      try {
        localStorage.setItem("eduproject_token", token);
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          try {
            localStorage.setItem("eduproject_user", JSON.stringify(profile));
          } catch {}
        } catch (profileErr) {
          console.warn(
            "Impossible de récupérer le profil OAuth2, fallback user",
            profileErr
          );
          const fallbackUser = {
            email: "user@oauth2.com",
            nom: "Utilisateur",
            prenom: "OAuth2",
            role: "ETUDIANT",
            estActif: true,
          };
          setUser(fallbackUser);
          try {
            localStorage.setItem(
              "eduproject_user",
              JSON.stringify(fallbackUser)
            );
          } catch {}
        }
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (err) {
        console.error("Erreur lors du traitement du callback OAuth2", err);
        setError("Erreur lors de la connexion OAuth2");
        localStorage.removeItem("eduproject_token");
      } finally {
        setLoading(false);
      }
    },
    [getAuthService]
  );

  const restoreSession = useCallback(async () => {
    setLoading(true);
    const authService = getAuthService();
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      if (tokenFromUrl) {
        await handleOAuth2Callback(tokenFromUrl);
        return;
      }

      const token = localStorage.getItem("eduproject_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        setUser(profile);
        try {
          localStorage.setItem("eduproject_user", JSON.stringify(profile));
        } catch {}
      } catch (err) {
        const status = err?.status || (err.body && err.body.statusCode) || null;
        const storedRaw = localStorage.getItem("eduproject_user");
        const storedUser = storedRaw ? JSON.parse(storedRaw) : null;

        if (status === 401 || /401|Unauthorized/i.test(err?.message || "")) {
          try {
            await authService.refreshTokenIfAvailable();
            const profile = await authService.getProfile();
            setUser(profile);
            try {
              localStorage.setItem("eduproject_user", JSON.stringify(profile));
            } catch {}
          } catch (refreshErr) {
            console.warn("Refresh échoué", refreshErr);
            await doLogout();
          }
        } else {
          if (storedUser) {
            console.warn(
              "Erreur non-auth lors de récupération profil; restauration depuis localStorage",
              err
            );
            setUser(storedUser);
          } else {
            console.warn(
              "Impossible de restaurer le profil et aucun user stocké",
              err
            );
            await doLogout();
          }
        }
      }
    } catch (e) {
      console.error("Erreur lors de la restauration de session", e);
      await doLogout();
    } finally {
      setLoading(false);
    }
  }, [doLogout, handleOAuth2Callback, getAuthService]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (email, password) => {
      clearError();
      setLoading(true);
      const authService = getAuthService();
      let loginSucceeded = false;
      try {
        const response = await authService.login(email, password);
        if (!response || !response.token) {
          const err = new Error(
            response?.message || "Login failed: no token returned"
          );
          err.status = response?.statusCode || 401;
          throw err;
        }
        try {
          localStorage.setItem("eduproject_token", response.token);
        } catch (e) {
          console.warn(e);
        }
        if (response.refreshToken) {
          try {
            localStorage.setItem(
              "eduproject_refresh_token",
              response.refreshToken
            );
          } catch (e) {
            /*ignore*/
          }
        }
        const loggedUser = response.user || null;
        setUser(loggedUser);
        try {
          localStorage.setItem("eduproject_user", JSON.stringify(loggedUser));
        } catch (e) {
          /*ignore*/
        }
        loginSucceeded = true;
        return response;
      } catch (err) {
        const msg = err?.message || "Erreur de connexion";
        setError(msg);
        throw err;
      } finally {
        if (loginSucceeded) {
          // Laisser l'écran de chargement visible ~30 secondes après une connexion réussie
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        setLoading(false);
      }
    },
    [clearError, getAuthService]
  );

  const register = useCallback(async (userData) => {
    clearError();
    const authService = getAuthService();

    try {
      const response = await authService.register(userData);

      // Si le backend renvoie un token → login automatique
      if (response.token) {
        try {
          localStorage.setItem("eduproject_token", response.token);
        } catch {}
        if (response.refreshToken)
          try {
            localStorage.setItem(
              "eduproject_refresh_token",
              response.refreshToken
            );
          } catch {}
        const newUser = response.user || null;
        setUser(newUser);
        try {
          localStorage.setItem("eduproject_user", JSON.stringify(newUser));
        } catch {}
      }
      return response;
    } catch (err) {
      const msg = err?.message || "Erreur d'inscription";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const forgotPassword = useCallback(
    async (email) => {
      clearError();
      const authService = getAuthService();
      try {
        const response = await authService.forgotPassword(email);
        return response;
      } catch (err) {
        const msg =
          err?.message || "Erreur lors de la demande de réinitialisation";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, getAuthService]
  );

  const resetPassword = useCallback(
    async (token, newPassword) => {
      clearError();
      const authService = getAuthService();
      try {
        const response = await authService.resetPassword(token, newPassword);
        return response;
      } catch (err) {
        const msg = err?.message || "Erreur lors de la réinitialisation";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, getAuthService]
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      clearError();
      setLoading(true);
      const authService = getAuthService();
      try {
        const response = await authService.changePassword(
          currentPassword,
          newPassword
        );
        return response;
      } catch (err) {
        const msg = err?.message || "Erreur lors du changement de mot de passe";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, getAuthService]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await doLogout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Nettoyer quand même en cas d'erreur
      localStorage.removeItem("eduproject_token");
      localStorage.removeItem("eduproject_refresh_token");
      localStorage.removeItem("eduproject_user");
      setUser(null);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, [doLogout]);

  const loginWithOAuth2 = useCallback(
    (provider) => {
      clearError();
      const authService = getAuthService();
      try {
        const urls = authService.getOAuth2Urls();
        const oauthUrl = urls[provider.toLowerCase()];
        if (!oauthUrl) throw new Error(`Provider ${provider} non supporté`);
        window.location.href = oauthUrl;
      } catch (err) {
        setError(err.message || "Erreur OAuth2");
      }
    },
    [clearError, getAuthService]
  );

  const verifyEmail = useCallback(
    async (token) => {
      const authService = getAuthService();
      try {
        const response = await authService.verifyEmail(token);
        return response;
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [getAuthService]
  );

  const resendVerificationEmail = useCallback(
    async (email) => {
      const authService = getAuthService();
      try {
        const response = await authService.resendVerificationEmail(email);
        return response;
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [getAuthService]
  );

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...updates };
      try {
        localStorage.setItem("eduproject_user", JSON.stringify(updated));
      } catch (e) {
        /* ignore */
      }
      return updated;
    });
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loginWithOAuth2,
    verifyEmail,
    resendVerificationEmail,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    loading,
    error,
    clearError,
    setError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContext;
