import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../UI/LoadingSpinner';

const GroupForm = ({ group, onSubmit, onCancel, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group && mode === 'edit') {
      setFormData({
        nom: group.nom || '',
        description: group.description || ''
      });
    }
  }, [group, mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du groupe est requis';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        // Le parent gère la fermeture
      }
    } catch (error) {
      console.error('Erreur soumission formulaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="group-form-overlay">
      <div className="group-form-modal">
        <div className="modal-header">
          <div className="modal-title">
            <h3>
              <i className="fas fa-users" />{' '}
              {mode === 'create' ? 'Créer un nouveau groupe' : 'Modifier le groupe'}
            </h3>
            <p>
              {mode === 'create'
                ? 'Définissez un nom clair et une courte description.'
                : 'Ajustez les informations principales de ce groupe.'}
            </p>
          </div>
          <button
            type="button"
            className="group-form-close"
            onClick={onCancel}
            aria-label="Fermer le formulaire de groupe"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="group-form">
          <div className="form-group">
            <label htmlFor="nom" className="form-label">
              Nom du groupe *
            </label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              className={`form-input ${errors.nom ? 'error' : ''}`}
              placeholder="Ex: Groupe Développement Web"
              disabled={loading}
            />
            {errors.nom && <div className="form-error">{errors.nom}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`form-input ${errors.description ? 'error' : ''}`}
              placeholder="Décrivez l'objectif ou la spécialité de ce groupe..."
              rows="4"
              disabled={loading}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
            <div className="form-hint">
              Cette description aide à identifier le rôle ou la spécialité du groupe
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  {mode === 'create' ? 'Création...' : 'Mise à jour...'}
                </>
              ) : (
                <>
                  <i className={`fas fa-${mode === 'create' ? 'plus' : 'save'}`}></i>
                  {mode === 'create' ? 'Créer le groupe' : 'Enregistrer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupForm;