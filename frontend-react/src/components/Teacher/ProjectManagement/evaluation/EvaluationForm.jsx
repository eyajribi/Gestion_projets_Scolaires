import React, { useState } from 'react';
import LoadingSpinner from '../../Common/LoadingSpinner';

const EvaluationForm = ({ deliverable, onSubmit, onCancel, existingEvaluation }) => {
  const [formData, setFormData] = useState({
    note: existingEvaluation?.note || '',
    commentaires: existingEvaluation?.commentaires || ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.note || formData.note === '') {
      newErrors.note = 'La note est requise';
    } else {
      const note = parseFloat(formData.note);
      if (isNaN(note) || note < 0 || note > 20) {
        newErrors.note = 'La note doit être un nombre entre 0 et 20';
      }
    }

    if (!formData.commentaires.trim()) {
      newErrors.commentaires = 'Les commentaires sont requis';
    } else if (formData.commentaires.trim().length < 10) {
      newErrors.commentaires = 'Les commentaires doivent contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(parseFloat(formData.note), formData.commentaires.trim());
    } catch (error) {
      // L'erreur est gérée par le parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getAppreciation = (note) => {
    if (note >= 16) return 'Très bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  };

  return (
    <div className="evaluation-form-overlay">
      <div className="evaluation-form-modal">
        <div className="modal-header">
          <h3>Évaluation du livrable</h3>
          <p>{deliverable.nom} - {deliverable.projet.nom}</p>
        </div>

        <form onSubmit={handleSubmit} className="evaluation-form">
          <div className="form-group">
            <label htmlFor="note" className="form-label">
              Note /20 *
            </label>
            <input
              type="number"
              id="note"
              min="0"
              max="20"
              step="0.5"
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className={`form-input ${errors.note ? 'error' : ''}`}
              placeholder="Ex: 15.5"
              disabled={submitting}
            />
            {formData.note && !errors.note && (
              <div className="note-preview">
                Appréciation: <strong>{getAppreciation(parseFloat(formData.note))}</strong>
              </div>
            )}
            {errors.note && <div className="form-error">{errors.note}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="commentaires" className="form-label">
              Commentaires détaillés *
            </label>
            <textarea
              id="commentaires"
              value={formData.commentaires}
              onChange={(e) => handleChange('commentaires', e.target.value)}
              className={`form-input ${errors.commentaires ? 'error' : ''}`}
              placeholder="Rédigez un commentaire détaillé sur le travail réalisé, les points forts, les axes d'amélioration..."
              rows="6"
              disabled={submitting}
            />
            {errors.commentaires && <div className="form-error">{errors.commentaires}</div>}
            <div className="form-hint">
              Minimum 10 caractères. Ces commentaires seront visibles par les étudiants.
            </div>
          </div>

          {/* Grille d'évaluation guidée */}
          <div className="evaluation-guide">
            <h4>Points d'évaluation</h4>
            <div className="evaluation-criteria">
              <div className="criterion">
                <label>Respect des consignes</label>
                <div className="criterion-options">
                  {[2, 4, 6, 8, 10].map(score => (
                    <label key={score} className="criterion-option">
                      <input
                        type="radio"
                        name="consignes"
                        value={score}
                        onChange={() => {}}
                      />
                      <span>{score}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="criterion">
                <label>Qualité technique</label>
                <div className="criterion-options">
                  {[2, 4, 6, 8, 10].map(score => (
                    <label key={score} className="criterion-option">
                      <input
                        type="radio"
                        name="technique"
                        value={score}
                        onChange={() => {}}
                      />
                      <span>{score}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Évaluation en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  {existingEvaluation ? 'Mettre à jour' : 'Valider l\'évaluation'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationForm;