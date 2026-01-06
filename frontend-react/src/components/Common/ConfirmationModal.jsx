import React from 'react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation de suppression",
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmText = "Supprimer",
  cancelText = "Annuler",
  type = "danger",
  confirmDisabled = false,
  confirmTooltip,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (confirmDisabled) return;
    onConfirm();
    onClose();
  };

  const renderMessage = () => {
    if (typeof message === 'string') {
      const lines = message.split('\n').filter((line) => line.trim().length > 0);
      return lines.map((line, index) => (
        <p key={index}>{line}</p>
      ));
    }
    return message;
  };

  return (
    <div className="modal-overlay active" onClick={handleBackdropClick}>
      <div className="confirmation-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-icon" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="confirmation-icon">
            <i className={`fas fa-exclamation-triangle ${type}`}></i>
          </div>
          <div className="confirmation-message">
            {renderMessage()}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} 
            disabled={confirmDisabled}
            title={confirmDisabled && confirmTooltip ? confirmTooltip : undefined}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .confirmation-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
        }

        .modal-body {
          padding: 24px;
          text-align: center;
        }

        .confirmation-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .confirmation-icon .danger {
          color: #ef4444;
        }

        .confirmation-icon .warning {
          color: #f59e0b;
        }

        .confirmation-icon .info {
          color: #3b82f6;
        }

        .modal-body p {
          margin: 0;
          color: #6b7280;
          line-height: 1.5;
        }

        .confirmation-message p + p {
          margin-top: 0.35rem;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .btn {
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .btn:hover {
          background: #f9fafb;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
          border-color: #6b7280;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: #f8fafc;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-icon:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;