import React, { useEffect } from 'react';

const Notification = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        <i className={getIcon()}></i>
      </div>
      <div className="notification-content">
        {message}
      </div>
      <button 
        className="notification-close"
        onClick={onClose}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Notification;