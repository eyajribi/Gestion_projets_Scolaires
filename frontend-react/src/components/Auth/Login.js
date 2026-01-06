import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import SocialAuth from "./SocialAuth";

const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 15 * 60 * 1000; // 15 minutes en ms

const Login = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [blockedTimeLeft, setBlockedTimeLeft] = useState(0);
  const [flashMessage, setFlashMessage] = useState("");

  const { login, error, clearError, setError } = useAuth();

  // Vérifier si on est bloqué au chargement
  useEffect(() => {
    const blockedUntil = localStorage.getItem("login_blocked_until");
    if (blockedUntil) {
      const timeLeft = Number(blockedUntil) - new Date().getTime();
      if (timeLeft > 0) setBlockedTimeLeft(timeLeft);
      else localStorage.removeItem("login_blocked_until");
    }
  }, []);

  // Compte à rebours en temps réel
  useEffect(() => {
    if (!blockedTimeLeft) return;
    const timer = setInterval(() => {
      setBlockedTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          localStorage.removeItem("login_blocked_until");
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [blockedTimeLeft]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error && clearError) clearError();
    setFlashMessage(""); // Effacer le message flash quand l'utilisateur tape
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleClearError = () => {
    if (clearError) clearError();
  };

  const handleClearFlash = () => {
    setFlashMessage("");
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (onSwitchToForgotPassword) {
      onSwitchToForgotPassword();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (blockedTimeLeft > 0) {
      setError(
        `Trop de tentatives. Réessayez dans ${Math.ceil(
          blockedTimeLeft / 60000
        )} minute(s).`
      );
      return;
    }

    if (!formData.email || !formData.password) return;

    setIsLoading(true);

    try {
      const response = await login(formData.email, formData.password);

      // Message flash de succès
      if (response && response.message) {
        setFlashMessage(response.message);
      } else {
        setFlashMessage("Connexion réussie ! Redirection en cours...");
      }

      // Réinitialiser les tentatives après succès
      localStorage.removeItem("login_attempts");
      localStorage.removeItem("login_blocked_until");
      setBlockedTimeLeft(0);

      // Optionnel: Redirection automatique après un délai
      setTimeout(() => {
        setFlashMessage("");
      }, 3000);

    } catch (err) {
      let attempts = Number(localStorage.getItem("login_attempts")) || 0;
      attempts += 1;

      if (attempts >= MAX_ATTEMPTS) {
        const blockUntil = new Date().getTime() + BLOCK_TIME;
        localStorage.setItem("login_blocked_until", blockUntil);
        setBlockedTimeLeft(BLOCK_TIME);
        setError("Trop de tentatives. Réessayez dans 15 minutes.");
        localStorage.setItem("login_attempts", 0);
      } else {
        localStorage.setItem("login_attempts", attempts);
        setError(
          `Identifiants incorrects. Tentative ${attempts} sur ${MAX_ATTEMPTS}.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Formattage du timer en mm:ss
  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="auth-form-modern" role="form" aria-labelledby="login-title">
      <div className="auth-header">
        <h2 id="login-title">Connexion</h2>
        <p className="auth-subtitle">Accédez à votre espace EduProject</p>
      </div>

      {/* Message flash de succès */}
      {flashMessage && (
        <div className="alert-modern alert-success" role="alert">
          <div className="alert-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="alert-content">
            <span className="alert-title">Connexion réussie</span>
            <p>{flashMessage}</p>
          </div>
          <button
            className="alert-close"
            onClick={handleClearFlash}
            aria-label="Fermer le message"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <SocialAuth isLoading={isLoading} />
      
      <div className="auth-divider">
        <span>Ou continuer avec</span>
      </div>

      {error && (
        <div className="alert-modern alert-error" role="alert">
          <div className="alert-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="alert-content">
            <span className="alert-title">Erreur d'authentification</span>
            <p>{error}</p>
          </div>
          <button
            className="alert-close"
            onClick={handleClearError}
            aria-label="Fermer l'alerte"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {blockedTimeLeft > 0 && (
        <div className="alert-modern alert-info" role="alert">
          <div className="alert-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="alert-content">
            <span className="alert-title">Accès temporairement bloqué</span>
            <p>Réessayez dans : {formatTime(blockedTimeLeft)}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="input-group-modern">
          <div className="input-wrapper">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              required
              disabled={isLoading || blockedTimeLeft > 0}
              className="input-modern"
              autoComplete="email"
              aria-describedby="email-hint"
              id="login-email"
            />
            <label className="input-label" htmlFor="login-email">
              Adresse email
            </label>
            <div className="input-icon">
              <i className="fas fa-at"></i>
            </div>
          </div>
          <div id="email-hint" className="input-hint">
            Utilisez votre email institutionnel ou personnel
          </div>
        </div>

        <div className="input-group-modern">
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              required
              disabled={isLoading || blockedTimeLeft > 0}
              className="input-modern"
              autoComplete="current-password"
              id="login-password"
            />
            <label className="input-label" htmlFor="login-password">
              Mot de passe
            </label>
            <div className="input-icon">
              <i className="fas fa-lock"></i>
            </div>
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              disabled={isLoading || blockedTimeLeft > 0}
            >
              <i
                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              ></i>
            </button>
          </div>
        </div>

        <div className="form-options">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="link-modern"
            disabled={isLoading || blockedTimeLeft > 0}
          >
            <i className="fas fa-key"></i>
            Mot de passe oublié ?
          </button>
        </div>

        <button
          type="submit"
          className="btn-modern btn-primary full-width"
          disabled={
            isLoading ||
            !formData.email ||
            !formData.password ||
            blockedTimeLeft > 0
          }
          data-loading={isLoading}
          aria-busy={isLoading}
        >
          <span className="btn-content">
            <i className="fas fa-fingerprint"></i>
            S'authentifier
          </span>
          <div className="btn-loader">
            <div className="loader-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Nouveau sur EduProject ?{" "}
          <button
            onClick={onSwitchToRegister}
            className="link-modern link-accent"
            disabled={isLoading || blockedTimeLeft > 0}
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;