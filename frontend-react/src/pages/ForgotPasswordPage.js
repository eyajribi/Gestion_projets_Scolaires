import React from 'react';
import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = React.lazy(() => import('../components/Auth/ForgotPassword'));

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/');
  };

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
          Entrez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
        </p>
      </div>

      <div className="login-right">
        <Suspense fallback={<div>Chargement...</div>}>
          <ForgotPassword onBackToLogin={handleBackToLogin} />
        </Suspense>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;