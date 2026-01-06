import React, { useMemo } from 'react';

const PROJECT_QUOTES = [
  {
    text: "Un bon projet commence par une vision claire.",
    author: "Gestion de projets"
  },
  {
    text: "Planifier, prioriser, puis exécuter étape par étape.",
    author: "Organisation"
  },
  {
    text: "Une équipe alignée vaut plus qu'un planning parfait.",
    author: "Travail d'équipe"
  },
  {
    text: "Chaque livrable est une petite victoire vers l'objectif final.",
    author: "Suivi de projet"
  },
  {
    text: "Les meilleurs projets sont ceux que l'on améliore en continu.",
    author: "Amélioration continue"
  }
];

const LoadingSpinner = ({
  size = 'large',
  message,
  fullScreen = false,
  showQuote = false,
}) => {
  const sizes = {
    small: '1.75rem',
    medium: '2.4rem',
    large: '3.25rem'
  };

  // Choisir une citation aléatoire mais stable pendant le rendu
  const quote = useMemo(() => {
    const index = Math.floor(Math.random() * PROJECT_QUOTES.length);
    return PROJECT_QUOTES[index];
  }, []);

  const wrapperClass = fullScreen ? 'loading' : 'loading-centered';

  return (
    <div className={wrapperClass} role="status" aria-live="polite">
      <div className="loading-spinner">
        <div
          className="spinner"
          style={{
            width: sizes[size],
            height: sizes[size]
          }}
        >
          <div className="spinner-inner"></div>
        </div>
        <div className="loading-text">
          <p className="loading-main">
            {message || 'Chargement...'}
          </p>
          {fullScreen && showQuote && quote && (
            <p className="loading-quote">
              « {quote.text} »
              <span className="loading-quote-author"> — {quote.author}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;