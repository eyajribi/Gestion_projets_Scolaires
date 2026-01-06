import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../UI/LoadingSpinner';
import '../ProjectForm.css';

const ProjectForm = ({ project, onSubmit, onCancel, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    statut: 'PLANIFIE'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState({});

  useEffect(() => {
    if (project && mode === 'edit') {
      const dateDebut = project.dateDebut ? new Date(project.dateDebut).toISOString().split('T')[0] : '';
      const dateFin = project.dateFin ? new Date(project.dateFin).toISOString().split('T')[0] : '';
      
      setFormData({
        nom: project.nom || '',
        description: project.description || '',
        dateDebut: dateDebut,
        dateFin: dateFin,
        statut: project.statut || 'PLANIFIE'
      });

      // Vérifications initiales pour l'édition
      validateBusinessRules({
        ...project,
        dateDebut,
        dateFin,
        statut: project.statut || 'PLANIFIE'
      }, true);
    }
  }, [project, mode]);

  // Règles métier pour les transitions d'état
  const statutTransitions = {
    PLANIFIE: ['EN_COURS', 'ANNULE'],
    EN_COURS: ['TERMINE', 'ANNULE'],
    TERMINE: [],
    ANNULE: ['PLANIFIE']
  };

  // Validation des règles métier
  const validateBusinessRules = (data, isInitial = false) => {
    const newWarnings = {};
    const today = new Date().toISOString().split('T')[0];

    // Vérifications pour l'édition seulement
    if (mode === 'edit' && project) {
      // 1. Vérification transition d'état
      if (!isInitial && data.statut !== project.statut) {
        const allowedTransitions = statutTransitions[project.statut];
        if (!allowedTransitions.includes(data.statut)) {
          newWarnings.statut = `Transition non autorisée: ${project.statut} → ${data.statut}`;
        }

        // 2. Vérification spécifique pour "Terminé"
        if (data.statut === 'TERMINE') {
          if (data.dateFin > today) {
            newWarnings.statut = 'Un projet ne peut pas être marqué comme terminé avant sa date de fin';
          }
        }

        // 3. Vérification spécifique pour "Annulé"
        if (data.statut === 'ANNULE' && project.statut === 'TERMINE') {
          newWarnings.statut = 'Un projet terminé ne peut pas être annulé';
        }
      }

      // 4. Vérification des dates par rapport à l'état
      if (data.statut === 'TERMINE' && data.dateFin > today) {
        newWarnings.dateFin = 'La date de fin doit être dans le passé pour un projet terminé';
      }

      // 5. Vérification cohérence dates/état
      if (data.dateDebut && data.dateFin) {
        const dateDebut = new Date(data.dateDebut);
        const dateFin = new Date(data.dateFin);
        
        if (data.statut === 'PLANIFIE' && dateDebut <= new Date()) {
          newWarnings.dateDebut = 'Un projet planifié devrait avoir une date de début future';
        }

        if (data.statut === 'EN_COURS' && dateDebut > new Date()) {
          newWarnings.dateDebut = 'Un projet en cours devrait avoir une date de début passée';
        }

        if (data.statut === 'EN_COURS' && dateFin < new Date()) {
          newWarnings.statut = 'Le projet semble en retard. Vérifiez la date de fin.';
        }
      }
    }

    // 6. Vérifications générales des dates
    if (data.dateDebut && data.dateFin) {
      const dateDebut = new Date(data.dateDebut);
      const dateFin = new Date(data.dateFin);
      const aujourdHui = new Date();

      // Durée minimale du projet (7 jours)
      const dureeMinimale = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes
      if ((dateFin - dateDebut) < dureeMinimale) {
        newWarnings.dateFin = 'La durée du projet semble très courte (minimum 7 jours recommandé)';
      }

      // Projet trop long (1 an)
      const dureeMaximale = 365 * 24 * 60 * 60 * 1000; // 1 an en millisecondes
      if ((dateFin - dateDebut) > dureeMaximale) {
        newWarnings.dateFin = 'La durée du projet semble très longue (maximum 1 an recommandé)';
      }

      // Date de début dans le passé pour nouvelle création
      if (mode === 'create' && dateDebut < aujourdHui) {
        newWarnings.dateDebut = 'La date de début est dans le passé';
      }
    }

    setWarnings(newWarnings);
    return Object.keys(newWarnings).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation de base
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du projet est requis';
    } else if (formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.nom.trim().length > 100) {
      newErrors.nom = 'Le nom ne doit pas dépasser 100 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'La description ne doit pas dépasser 1000 caractères';
    }

    if (!formData.dateDebut) {
      newErrors.dateDebut = 'La date de début est requise';
    }

    if (!formData.dateFin) {
      newErrors.dateFin = 'La date de fin est requise';
    } else if (formData.dateDebut && new Date(formData.dateFin) <= new Date(formData.dateDebut)) {
      newErrors.dateFin = 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);

    // Validation des règles métier
    const businessRulesValid = validateBusinessRules(formData);

    return Object.keys(newErrors).length === 0 && businessRulesValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Confirmation pour certaines actions critiques
    if (mode === 'edit' && project) {
      if (formData.statut !== project.statut) {
        const confirmationMessage = getStatutChangeConfirmation(project.statut, formData.statut);
        if (confirmationMessage && !window.confirm(confirmationMessage)) {
          return;
        }
      }
    }

    setLoading(true);
    try {
      const success = await onSubmit({
        ...formData,
        dateDebut: new Date(formData.dateDebut).toISOString(),
        dateFin: new Date(formData.dateFin).toISOString()
      });
      
      if (success) {
        // Le parent gère la navigation
      }
    } catch (error) {
      console.error('Erreur soumission formulaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutChangeConfirmation = (ancienStatut, nouveauStatut) => {
    const messages = {
      'PLANIFIE_EN_COURS': 'Démarrer le projet ? Cette action est irréversible.',
      'EN_COURS_TERMINE': 'Marquer le projet comme terminé ? Cette action est irréversible.',
      'EN_COURS_ANNULE': 'Annuler le projet ? Cette action est irréversible.',
      'TERMINE_PLANIFIE': 'Replanifier un projet terminé ?',
      'ANNULE_PLANIFIE': 'Reprendre un projet annulé ?'
    };
    
    return messages[`${ancienStatut}_${nouveauStatut}`];
  };

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Effacer les erreurs pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Effacer les warnings pour ce champ
    if (warnings[field]) {
      setWarnings(prev => ({ ...prev, [field]: '' }));
    }

    // Validation en temps réel pour certains champs
    if (field === 'dateDebut' || field === 'dateFin' || field === 'statut') {
      setTimeout(() => validateBusinessRules(newFormData), 100);
    }
  };

  // Calculer la durée du projet en jours
  const getDureeProjet = () => {
    if (formData.dateDebut && formData.dateFin) {
      const debut = new Date(formData.dateDebut);
      const fin = new Date(formData.dateFin);
      const diffTime = Math.abs(fin - debut);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  // Vérifier si le formulaire peut être soumis
  const canSubmit = () => {
    const hasErrors = Object.keys(errors).length > 0;
    const hasCriticalWarnings = Object.keys(warnings).length > 0;
    
    // Vous pouvez ajuster cette logique selon la sévérité des warnings
    // Ici, on considère que tous les warnings bloquent la soumission
    return !hasErrors && !hasCriticalWarnings;
  };

  const dureeProjet = getDureeProjet();

  return (
    <div className="project-form-page">
      <div className="form-header">
        <h1>
          {mode === 'create' ? 'Créer un nouveau projet' : 'Modifier le projet'}
        </h1>
        <p>
          {mode === 'create' 
            ? 'Remplissez les informations pour créer un nouveau projet pédagogique'
            : 'Modifiez les informations du projet'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-grid">
          {/* Nom du projet */}
          <div className="form-group">
            <label htmlFor="nom" className="form-label">
              Nom du projet *
            </label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              className={`form-input ${errors.nom ? 'error' : ''}`}
              placeholder="Ex: Application Mobile de Gestion"
              disabled={loading}
              maxLength={100}
            />
            {errors.nom && <div className="form-error">{errors.nom}</div>}
            <div className="char-counter">
              {formData.nom.length}/100 caractères
            </div>
          </div>

          {/* Statut (édition seulement) */}
          {mode === 'edit' && (
            <div className="form-group">
              <label htmlFor="statut" className="form-label">
                Statut
              </label>
              <select
                id="statut"
                value={formData.statut}
                onChange={(e) => handleChange('statut', e.target.value)}
                className={`form-input ${warnings.statut ? 'warning' : ''}`}
                disabled={loading}
              >
                <option value="PLANIFIE">Planifié</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINE">Terminé</option>
                <option value="ANNULE">Annulé</option>
              </select>
              {warnings.statut && (
                <div className="form-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  {warnings.statut}
                </div>
              )}
              {project && formData.statut !== project.statut && (
                <div className="form-info">
                  <i className="fas fa-info-circle"></i>
                  Changement d'état: {project.statut} → {formData.statut}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="form-group full-width">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`form-input ${errors.description ? 'error' : ''}`}
              placeholder="Décrivez les objectifs, le contexte et les attentes du projet..."
              rows="4"
              disabled={loading}
              maxLength={1000}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
            <div className="form-hint">
              Cette description sera visible par les étudiants participants
            </div>
            <div className="char-counter">
              {formData.description.length}/1000 caractères
            </div>
          </div>

          {/* Dates */}
          <div className="form-group">
            <label htmlFor="dateDebut" className="form-label">
              Date de début *
            </label>
            <input
              type="date"
              id="dateDebut"
              value={formData.dateDebut}
              onChange={(e) => handleChange('dateDebut', e.target.value)}
              className={`form-input ${errors.dateDebut ? 'error' : ''} ${warnings.dateDebut ? 'warning' : ''}`}
              disabled={loading}
              min={mode === 'create' ? new Date().toISOString().split('T')[0] : undefined}
            />
            {errors.dateDebut && <div className="form-error">{errors.dateDebut}</div>}
            {warnings.dateDebut && (
              <div className="form-warning">
                <i className="fas fa-exclamation-triangle"></i>
                {warnings.dateDebut}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dateFin" className="form-label">
              Date de fin *
            </label>
            <input
              type="date"
              id="dateFin"
              value={formData.dateFin}
              onChange={(e) => handleChange('dateFin', e.target.value)}
              className={`form-input ${errors.dateFin ? 'error' : ''} ${warnings.dateFin ? 'warning' : ''}`}
              disabled={loading}
              min={formData.dateDebut || new Date().toISOString().split('T')[0]}
            />
            {errors.dateFin && <div className="form-error">{errors.dateFin}</div>}
            {warnings.dateFin && (
              <div className="form-warning">
                <i className="fas fa-exclamation-triangle"></i>
                {warnings.dateFin}
              </div>
            )}
            {dureeProjet > 0 && (
              <div className="form-info">
                <i className="fas fa-calendar"></i>
                Durée: {dureeProjet} jour{dureeProjet > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Résumé des validations */}
        {(Object.keys(warnings).length > 0 || Object.keys(errors).length > 0) && (
          <div className="validation-summary">
            <h4>
              <i className="fas fa-clipboard-check"></i>
              Vérifications
            </h4>
            {Object.keys(errors).length > 0 && (
              <div className="validation-errors">
                <strong>Erreurs à corriger:</strong>
                <ul>
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>• {message}</li>
                  ))}
                </ul>
              </div>
            )}
            {Object.keys(warnings).length > 0 && (
              <div className="validation-warnings">
                <strong>Avertissements:</strong>
                <ul>
                  {Object.entries(warnings).map(([field, message]) => (
                    <li key={field}>• {message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions du formulaire */}
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
            disabled={loading || !canSubmit()}
            title={!canSubmit() ? "Veuillez corriger les erreurs et avertissements avant de soumettre" : ""}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                {mode === 'create' ? 'Création...' : 'Mise à jour...'}
              </>
            ) : (
              <>
                <i className={`fas fa-${mode === 'create' ? 'plus' : 'save'}`}></i>
                {mode === 'create' ? 'Créer le projet' : 'Enregistrer les modifications'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Aide contextuelle */}
      <div className="form-help">
        <div className="help-card">
          <h4>
            <i className="fas fa-lightbulb"></i>
            Conseils pour un bon projet
          </h4>
          <ul>
            <li>Choisissez un nom clair et descriptif</li>
            <li>Définissez des objectifs pédagogiques précis</li>
            <li>Estimez un temps réaliste pour la réalisation</li>
            <li>Prévoyez des étapes intermédiaires (tâches)</li>
            <li>Communiquez clairement les attentes aux étudiants</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;