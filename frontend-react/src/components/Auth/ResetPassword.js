import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { resetPassword, error, clearError } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    console.log('Token reçu:', token);
    if (!token) {
      console.log('Aucun token trouvé, redirection vers /');
      navigate('/');
    }
  }, [token, navigate]);

  // Effet pour gérer les erreurs du contexte
  useEffect(() => {
    if (error) {
      setMessage(error);
      setMessageType('error');
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Soumission du formulaire avec token:', token);
    
    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      setMessageType('error');
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères");
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');
    if (clearError) clearError();

    try {
      console.log('Appel de resetPassword avec token:', token);
      const response = await resetPassword(token, newPassword);
      console.log('Réponse reçue:', response);
      
      setMessage(response?.message || 'Mot de passe réinitialisé avec succès');
      setMessageType('success');
      
      // Redirection après 3 secondes pour laisser voir le message
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.' 
          } 
        });
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de la réinitialisation:', err);
      setMessage(err?.response?.data?.message || err?.message || 'Erreur lors de la réinitialisation');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  if (!token) {
    return (
      <div className="auth-form-modern">
        <div className="auth-header">
          <h2>Token manquant</h2>
          <p className="auth-subtitle">Le lien de réinitialisation est invalide</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-modern btn-primary full-width"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="logo mb-2">
          <div className="logo-icon" aria-hidden="true">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="logo-text">EduProject</div>
        </div>
        <h1>Réinitialisation du mot de passe</h1>
        <p>
          Créez votre nouveau mot de passe pour accéder à votre compte.
        </p>
      </div>

      <div className="login-right">
        <div className="auth-form-modern">
          <div className="auth-header">
            <h2>Nouveau mot de passe</h2>
            <p className="auth-subtitle">Créez votre nouveau mot de passe</p>
          </div>

          {/* Afficher soit le message, soit l'erreur, pas les deux */}
          {(message || error) && (
            <div className={`alert-modern ${messageType === 'success' || !messageType ? 'alert-success' : 'alert-error'}`}>
              <div className="alert-icon">
                <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
              </div>
              <div className="alert-content">
                <span className="alert-title">
                  {messageType === 'success' ? 'Succès' : 'Erreur'}
                </span>
                <p>{message || error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group-modern">
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder=" "
                  required
                  disabled={isLoading}
                  className="input-modern"
                  autoComplete="new-password"
                  id="new-password"
                  minLength="6"
                />
                <label className="input-label" htmlFor="new-password">
                  Nouveau mot de passe
                </label>
                <div className="input-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  disabled={isLoading}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              <div className="input-hint">
                Minimum 6 caractères
              </div>
            </div>

            <div className="input-group-modern">
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                  required
                  disabled={isLoading}
                  className="input-modern"
                  autoComplete="new-password"
                  id="confirm-password"
                />
                <label className="input-label" htmlFor="confirm-password">
                  Confirmer le mot de passe
                </label>
                <div className="input-icon">
                  <i className="fas fa-lock"></i>
                </div>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <div className="input-hint text-error">
                  Les mots de passe ne correspondent pas
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-modern btn-primary full-width"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              data-loading={isLoading}
            >
              <span className="btn-content">
                <i className="fas fa-key"></i>
                {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </span>
              {isLoading && (
                <div className="btn-loader">
                  <div className="loader-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <button
                onClick={() => navigate('/login')}
                className="link-modern link-accent"
                disabled={isLoading}
              >
                ← Retour à la connexion
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;