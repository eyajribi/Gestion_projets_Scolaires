import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={
        'theme-toggle-btn' +
        (theme === 'dark' ? ' dark' : ' light')
      }
      id="theme-toggle"
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      onClick={toggleTheme}
      type="button"
    >
      <span className="theme-toggle-icon">
        <i
          className={theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'}
          aria-hidden="true"
        ></i>
      </span>
    </button>
  );
};

export default ThemeToggle;