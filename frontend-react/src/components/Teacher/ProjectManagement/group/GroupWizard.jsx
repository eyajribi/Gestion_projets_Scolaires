import React, { useState } from 'react';
import StudentSelector from './StudentSelector';
import LoadingSpinner from '../../../UI/LoadingSpinner';

const GroupWizard = ({ onClose, onSubmit, students, fromProjectId, maxMembers = 5 }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    selectedStudents: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const remainingSlots = Math.max(0, maxMembers - formData.selectedStudents.length);

  const steps = [
    { number: 1, title: 'Informations', icon: 'fa-info-circle' },
    { number: 2, title: 'Membres', icon: 'fa-users' },
    { number: 3, title: 'Confirmation', icon: 'fa-check' }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.nom.trim()) {
        newErrors.nom = 'Le nom du groupe est requis';
      } else if (formData.nom.trim().length < 2) {
        newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'La description est requise';
      } else if (formData.description.trim().length < 10) {
        newErrors.description = 'La description doit contenir au moins 10 caractères';
      }
    }

    if (step === 2 && formData.selectedStudents.length === 0) {
      newErrors.students = 'Sélectionnez au moins un étudiant';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const success = await onSubmit({
        nom: formData.nom,
        description: formData.description,
        etudiants: formData.selectedStudents.map(s => s.id),
        projectId: fromProjectId || null,
      });
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erreur création groupe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: [...prev.selectedStudents, student]
    }));
  };

  const handleStudentRemove = (studentId) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.filter(s => s.id !== studentId)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="wizard-step">
            <h3>Informations du groupe</h3>
            <p className="step-subtitle">Définissez le nom et la description de votre nouveau groupe</p>
            
            <div className="form-group">
              <label className="form-label">Nom du groupe *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                className={`form-input ${errors.nom ? 'error' : ''}`}
                placeholder="Ex: Groupe Développement Frontend"
                maxLength={50}
              />
              {errors.nom && <div className="form-error">{errors.nom}</div>}
              <div className="char-count">{formData.nom.length}/50 caractères</div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`form-input ${errors.description ? 'error' : ''}`}
                placeholder="Décrivez l'objectif, la spécialité ou le rôle de ce groupe..."
                rows="4"
                maxLength={500}
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
              <div className="char-count">{formData.description.length}/500 caractères</div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-step">
            <h3>Sélection des membres</h3>
            <p className="step-subtitle">Ajoutez les étudiants qui feront partie de ce groupe</p>
            <p className={`capacity-info ${remainingSlots === 0 ? 'full' : ''}`}>
              Capacité du groupe : {formData.selectedStudents.length}/{maxMembers}
              {' — '}
              {remainingSlots === 0
                ? 'Aucune place restante.'
                : `${remainingSlots} place${remainingSlots > 1 ? 's' : ''} restante${remainingSlots > 1 ? 's' : ''}.`}
            </p>
            
            <StudentSelector
              students={students.filter(s => !formData.selectedStudents.find(sel => sel.id === s.id))}
              onSelect={handleStudentSelect}
              onClose={() => {}}
              title="Ajouter des membres"
              subtitle="Sélectionnez les étudiants à ajouter au groupe"
              maxSelection={remainingSlots}
              showHeader={false}
            />

            {formData.selectedStudents.length > 0 && (
              <div className="selected-students-section">
                <h4>Membres sélectionnés ({formData.selectedStudents.length}/{maxMembers})</h4>
                <p className={`capacity-info ${remainingSlots === 0 ? 'full' : ''}`}>
                  {remainingSlots === 0
                    ? 'Capacité maximale du groupe atteinte.'
                    : `${remainingSlots} place${remainingSlots > 1 ? 's' : ''} restante${remainingSlots > 1 ? 's' : ''}.`}
                </p>
                <div className="students-list">
                  {formData.selectedStudents.map(student => (
                    <div key={student.id} className="student-item">
                      <div className="student-avatar">
                        {student.urlPhotoProfil ? (
                          <img
                            src={student.urlPhotoProfil}
                            alt={`${student.prenom || ''} ${student.nom || ''}`.trim() || 'Photo étudiant'}
                          />
                        ) : (
                          <>
                            {student.prenom?.charAt(0)}{student.nom?.charAt(0)}
                          </>
                        )}
                      </div>
                      <div className="student-info">
                        <div className="student-name">
                          {student.prenom} {student.nom}
                        </div>
                        <div className="student-email">{student.email}</div>
                        {student.matricule && (
                          <div className="student-meta">
                            <span className="student-id">Matricule: {student.matricule}</span>
                          </div>
                        )}
                      </div>
                      <button
                        className="btn btn-icon btn-sm btn-danger"
                        onClick={() => handleStudentRemove(student.id)}
                        aria-label="Retirer l'étudiant"
                        title="Retirer du groupe"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="members-info-section">
                  <div className="info-card">
                    <i className="fas fa-info-circle"></i>
                    <div className="info-content">
                      <h5>Équipe collaborative</h5>
                      <p>Tous les membres du groupe ont les mêmes droits et responsabilités.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errors.students && (
              <div className="form-error alert-error">
                <i className="fas fa-exclamation-triangle"></i>
                {errors.students}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="wizard-step">
            <h3>Confirmation</h3>
            <p className="step-subtitle">Vérifiez les informations de votre nouveau groupe</p>
            
            <div className="confirmation-details">
              <div className="detail-section">
                <h4>Informations générales</h4>
                <div className="detail-item">
                  <span className="detail-label">Nom:</span>
                  <span className="detail-value">{formData.nom}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{formData.description}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Équipe ({formData.selectedStudents.length} membres)</h4>
                <div className="students-list-confirmation">
                  {formData.selectedStudents.map(student => (
                    <div key={student.id} className="student-item-confirmation">
                      <div className="student-avatar">
                        {student.urlPhotoProfil ? (
                          <img
                            src={student.urlPhotoProfil}
                            alt={`${student.prenom || ''} ${student.nom || ''}`.trim() || 'Photo étudiant'}
                          />
                        ) : (
                          <>
                            {student.prenom?.charAt(0)}{student.nom?.charAt(0)}
                          </>
                        )}
                      </div>
                      <div className="student-info">
                        <div className="student-name">
                          {student.prenom} {student.nom}
                        </div>
                        <div className="student-email">{student.email}</div>
                        {student.matricule && (
                          <div className="student-matricule">Matricule: {student.matricule}</div>
                        )}
                      </div>
                      <div className="member-role">
                        <i className="fas fa-user"></i>
                        Membre
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="creation-summary">
              <div className="summary-card">
                <h5>Résumé de la création</h5>
                <div className="summary-items">
                  <div className="summary-item">
                    <span className="summary-label">Taille du groupe:</span>
                    <span className="summary-value">{formData.selectedStudents.length}/{maxMembers}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Type de groupe:</span>
                    <span className="summary-value">Équipe collaborative</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Structure:</span>
                    <span className="summary-value">Égalitaire</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="group-wizard-overlay">
      <div className="group-wizard-modal">
        <div className="wizard-header">
          <div className="wizard-steps">
            {steps.map(step => (
              <div
                key={step.number}
                className={`step ${currentStep >= step.number ? 'active' : ''} ${currentStep === step.number ? 'current' : ''}`}
              >
                <div className="step-icon">
                  <i className={`fas ${step.icon}`}></i>
                </div>
                <div className="step-info">
                  <div className="step-number">{'Étape\u00A0'}{step.number}</div>
                  <div className="step-title">{step.title}</div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="btn btn-icon btn-close" onClick={onClose} aria-label="Fermer">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="wizard-content">
          {renderStep()}
        </div>

        <div className="wizard-actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleBack}
              disabled={loading}
            >
              <i className="fas fa-arrow-left" />
              Retour
            </button>
          )}

          <div className="actions-right">
            <button className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            
            {currentStep < steps.length ? (
              <button className="btn btn-primary" onClick={handleNext}>
                Suivant
                <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button 
                className="btn btn-success" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Création...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Créer le groupe
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .group-wizard-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .group-wizard-modal {
          background: var(--card-bg);
          border-radius: 20px;
          width: 100%;
          max-width: 820px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.5);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .wizard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px 18px;
          border-bottom: 1px solid var(--border-color);
          background:
            radial-gradient(circle at top left, rgba(59,130,246,0.16), transparent 55%),
            radial-gradient(circle at top right, rgba(34,197,94,0.14), transparent 55%),
            var(--bg-secondary);
          border-radius: 20px 20px 0 0;
        }

        .wizard-steps {
          display: flex;
          gap: 10px;
          flex: 1;
          padding: 4px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.12);
        }

        .step {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-radius: 999px;
          opacity: 0.7;
          transition: all 0.25s ease;
          flex: 1;
          min-width: 0;
        }

        .step.active {
          opacity: 1;
        }

        .step.current {
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: white;
          box-shadow: 0 6px 18px rgba(59, 130, 246, 0.45);
        }

        .step.current .step-info {
          color: white;
        }

        .step-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: transparent;
          color: inherit;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .step.current .step-icon {
          color: white;
        }

        .step-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .step-number {
          font-size: 0.7rem;
          color: rgba(148, 163, 184, 0.95);
          font-weight: 500;
          margin-bottom: 1px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .step.current .step-number {
          color: rgba(248, 250, 252, 0.95);
        }

        .step-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .step.current .step-title {
          color: white;
        }

        .wizard-content {
          flex: 1;
          padding: 28px 32px;
          overflow-y: auto;
          background: var(--card-bg);
        }

        .wizard-step {
          max-width: 720px;
          margin: 0 auto;
        }

        .wizard-step h3 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .step-subtitle {
          margin: 0 0 28px 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          color: var(--text-primary);
          transition: all 0.2s ease;
          background: var(--bg-main);
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        .form-input.error {
          border-color: var(--danger-dark);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .form-error {
          color: var(--danger-dark);
          font-size: 0.875rem;
          margin-top: 6px;
          font-weight: 500;
        }

        .alert-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          margin-top: 16px;
        }

        .char-count {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: right;
          margin-top: 4px;
          font-style: italic;
        }

        .capacity-info {
          margin: 4px 0 0;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .capacity-info.full {
          color: var(--warning-dark);
          font-weight: 500;
        }

        .selected-students-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .selected-students-section h4 {
          margin: 0 0 16px 0;
          color: #374151;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .students-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .student-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .student-item:hover {
          border-color: #d1d5db;
          background: #f1f5f9;
        }

        .student-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .student-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: inherit;
          display: block;
        }

        .student-info {
          flex: 1;
        }

        .student-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 1rem;
          margin-bottom: 4px;
        }

        .student-email {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .student-meta {
          margin-top: 4px;
        }

        .student-id {
          font-size: 0.75rem;
          color: #9ca3af;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .members-info-section {
          margin-top: 20px;
        }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 8px;
        }

        .info-card i {
          color: #3b82f6;
          font-size: 1.1rem;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .info-content h5 {
          margin: 0 0 4px 0;
          color: #1e40af;
          font-size: 0.95rem;
        }

        .info-content p {
          margin: 0;
          color: #374151;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .confirmation-details {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .detail-section h4 {
          margin: 0 0 16px 0;
          color: #374151;
          font-size: 1.2rem;
          font-weight: 600;
          padding-bottom: 8px;
          border-bottom: 2px solid #f3f4f6;
        }

        .detail-item {
          display: flex;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-label {
          min-width: 120px;
          font-weight: 600;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .detail-value {
          flex: 1;
          color: #374151;
          font-size: 0.95rem;
        }

        .students-list-confirmation {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .student-item-confirmation {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .student-matricule {
          font-size: 0.75rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 4px;
        }

        .member-role {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #dcfce7;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-left: auto;
          white-space: nowrap;
        }

        .creation-summary {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .summary-card {
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .summary-card h5 {
          margin: 0 0 16px 0;
          color: #374151;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .summary-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .summary-value {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
          text-align: right;
        }

        .wizard-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
          border-radius: 0 0 16px 16px;
        }

        .actions-right {
          display: flex;
          gap: 12px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: 2px solid;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          font-family: inherit;
          white-space: nowrap;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-outline {
          background: white;
          border-color: #d1d5db;
          color: #374151;
        }

        .btn-outline:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
          border-color: #6b7280;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #4b5563;
          border-color: #4b5563;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
          border-color: #2563eb;
        }

        .btn-success {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .btn-success:hover:not(:disabled) {
          background: #059669;
          border-color: #059669;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 0.85rem;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background: #f8fafc;
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .btn-icon:hover {
          background: #e2e8f0;
        }

        .btn-close {
          background: transparent;
          color: #64748b;
        }

        .btn-close:hover {
          background: #f1f5f9;
          color: #374151;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .group-wizard-modal {
            max-height: 95vh;
            margin: 10px;
          }

          .wizard-header {
            flex-direction: column;
            gap: 16px;
            padding: 20px;
          }

          .wizard-steps {
            width: 100%;
          }

          .step {
            padding: 8px 12px;
            max-width: none;
          }

          .step-info {
            display: none;
          }

          .wizard-content {
            padding: 20px;
          }

          .wizard-actions {
            flex-direction: column;
            gap: 16px;
            padding: 20px;
          }

          .actions-right {
            width: 100%;
            justify-content: space-between;
          }

          .btn {
            flex: 1;
            justify-content: center;
            padding: 12px 16px;
          }

          .student-item {
            gap: 12px;
            padding: 12px;
          }

          .student-avatar {
            width: 40px;
            height: 40px;
            font-size: 0.9rem;
          }

          .detail-item {
            flex-direction: column;
            gap: 4px;
          }

          .detail-label {
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .student-name {
            font-size: 0.9rem;
          }

          .student-email {
            font-size: 0.8rem;
          }

          .summary-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .member-role {
            font-size: 0.7rem;
            padding: 4px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default GroupWizard;