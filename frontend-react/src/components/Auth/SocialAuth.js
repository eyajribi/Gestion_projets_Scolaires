import React from 'react';
import { useAuth } from '../../context/AuthContext';

const SocialAuth = ({ isLoading }) => {
  const { loginWithOAuth2 } = useAuth();

  const handleGoogleLogin = () => {
    loginWithOAuth2('google');
  };

  const handleGitHubLogin = () => {
    loginWithOAuth2('github');
  };


  return (
    <div className="social-auth">
      <button
        type="button"
        className="btn btn-outline full-width mb-1"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <i className="fab fa-google"></i>
        Se connecter avec Google
      </button>

      <button
        type="button"
        className="btn btn-outline full-width mb-1"
        onClick={handleGitHubLogin}
        disabled={isLoading}
      >
        <i className="fab fa-github"></i>
        Se connecter avec GitHub
      </button>
    </div>
  );
};

export default SocialAuth;