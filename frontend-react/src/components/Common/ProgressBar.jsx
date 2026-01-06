import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ value, max = 100, color = 'primary', showLabel = true, size = 'md' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const getColorClass = () => {
    const colors = {
      primary: 'progress-primary',
      success: 'progress-success',
      warning: 'progress-warning',
      danger: 'progress-danger',
      info: 'progress-info'
    };
    return colors[color] || 'progress-primary';
  };

  return (
    <div className={`progress-bar size-${size}`}>
      <div className="progress-track">
        <div 
          className={`progress-fill ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showLabel && (
        <div className="progress-label">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;