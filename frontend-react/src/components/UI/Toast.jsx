import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'fa-check-circle',
          bgColor: '#10b981',
          borderColor: '#059669',
          iconColor: '#10b981'
        };
      case 'error':
        return {
          icon: 'fa-exclamation-circle',
          bgColor: '#ef4444',
          borderColor: '#dc2626',
          iconColor: '#ef4444'
        };
      case 'warning':
        return {
          icon: 'fa-exclamation-triangle',
          bgColor: '#f59e0b',
          borderColor: '#d97706',
          iconColor: '#f59e0b'
        };
      case 'info':
        return {
          icon: 'fa-info-circle',
          bgColor: '#3b82f6',
          borderColor: '#2563eb',
          iconColor: '#3b82f6'
        };
      default:
        return {
          icon: 'fa-info-circle',
          bgColor: '#3b82f6',
          borderColor: '#2563eb',
          iconColor: '#3b82f6'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div className="toast-container">
      <div 
        className="toast"
        style={{
          backgroundColor: `${config.bgColor}15`,
          border: `1px solid ${config.borderColor}30`,
          borderLeft: `4px solid ${config.bgColor}`
        }}
      >
        <div className="toast-icon">
          <i 
            className={`fas ${config.icon}`}
            style={{ color: config.iconColor }}
          ></i>
        </div>
        <div className="toast-content">
          <p className="toast-message">{message}</p>
        </div>
        <button 
          className="toast-close"
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          animation: toastSlideIn 0.3s ease;
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          min-width: 300px;
          max-width: 400px;
          background: white;
        }

        .toast-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .toast-content {
          flex: 1;
        }

        .toast-message {
          margin: 0;
          color: #1f2937;
          font-size: 0.9rem;
          font-weight: 500;
          line-height: 1.4;
        }

        .toast-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: #6b7280;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .toast-close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #374151;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .toast-container {
            bottom: 10px;
            left: 10px;
            right: 10px;
            transform: none;
          }

          .toast {
            min-width: auto;
            max-width: none;
            margin: 0 auto;
          }

          @keyframes toastSlideIn {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;