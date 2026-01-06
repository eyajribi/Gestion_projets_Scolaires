import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './GlobalThemeToggle.css';

const GlobalThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      className={`theme-toggle-fab ${isDark ? 'dark' : 'light'}`}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      type="button"
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icon">
        <i
          className={isDark ? 'fas fa-moon' : 'fas fa-sun'}
          aria-hidden="true"
        />
      </span>
    </button>
  );
};

export default GlobalThemeToggle;
