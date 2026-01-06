import React from 'react';

const PasswordStrength = ({ password }) => {
  const calculateStrength = (pwd) => {
    let score = 0;
    
    // Longueur minimale
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    
    // Complexité
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;
    
    return Math.min(score, 5);
  };

  const strength = calculateStrength(password);
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const strengthColors = ['#ff3860', '#ff7860', '#ffcc00', '#00d4ff', '#00ff9d'];

  if (!password) return null;

  return (
    <div className="password-strength" aria-live="polite">
      <div className="strength-bars">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`strength-bar ${level <= strength ? 'active' : ''}`}
            style={{
              backgroundColor: level <= strength ? strengthColors[strength - 1] : 'var(--glass-border)'
            }}
          />
        ))}
      </div>
      <div className="strength-label" style={{ color: strengthColors[strength - 1] }}>
        {strengthLabels[strength - 1]}
      </div>
    </div>
  );
};

export default PasswordStrength;