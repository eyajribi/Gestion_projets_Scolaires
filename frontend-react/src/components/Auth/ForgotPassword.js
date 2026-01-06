import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { forgotPassword, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    if (clearError) clearError();

    try {
      const response = await forgotPassword(email);
      setMessage('Email de réinitialisation envoyé avec succès. Veuillez vérifier votre boîte de réception.');
      
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email de réinitialisation envoyé avec succès. Veuillez vérifier votre boîte de réception.'
          }
        });
      }, 3000);
    } catch (err) {
      // L'erreur est déjà gérée par le contexte
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-modern">
      <div className="auth-header">
        <h2>Mot de passe oublié</h2>
        <p className="auth-subtitle">Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>

      {error && (
        <div className="alert-modern alert-error">
          <div className="alert-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="alert-content">
            <span className="alert-title">Erreur</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {message && (
        <div className="alert-modern alert-success">
          <div className="alert-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="alert-content">
            <span className="alert-title">Succès</span>
            <p>{message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group-modern">
          <div className="input-wrapper">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
              disabled={isLoading}
              className="input-modern"
              autoComplete="email"
              id="forgot-email"
            />
            <label className="input-label" htmlFor="forgot-email">
              Adresse email
            </label>
            <div className="input-icon">
              <i className="fas fa-at"></i>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-modern btn-primary full-width"
          disabled={isLoading || !email}
          data-loading={isLoading}
        >
          <span className="btn-content">
            <i className="fas fa-paper-plane"></i>
            Envoyer le lien de réinitialisation
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
          <button
            onClick={onBackToLogin}
            className="link-modern link-accent"
            disabled={isLoading}
          >
            ← Retour à la connexion
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;