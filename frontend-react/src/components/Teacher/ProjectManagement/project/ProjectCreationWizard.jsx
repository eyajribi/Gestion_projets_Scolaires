import React, { useEffect, useState } from 'react';
import { groupService } from '../../../../services/groupService';
import LoadingSpinner from '../../../UI/LoadingSpinner';
import '../ProjectForm.css';
import './ProjectCreationWizard.css';

const ProjectCreationWizard = ({ onSubmit, onCancel, existingProjects = [], initialProject }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    if (initialProject) {
      return {
        nom: initialProject.nom ? initialProject.nom : '',
        description: initialProject.description ? initialProject.description : '',
        dateDebut: initialProject.dateDebut ? initialProject.dateDebut.split('T')[0] : '',
        dateFin: initialProject.dateFin ? initialProject.dateFin.split('T')[0] : '',
        statut: initialProject.statut ? initialProject.statut : 'PLANIFIE',
      };
    }
    return {
      nom: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      statut: 'PLANIFIE',
    };
  });
  const [errors, setErrors] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const templates = [
    {
      id: 'mini-projet',
      label: 'Mini-projet (4 semaines)',
      description:
        "Projet court idéal pour une première mise en situation ou un sprint intensif.",
      durationWeeks: 4,
    },
    {
      id: 'semestre',
      label: 'Projet semestriel (12 semaines)',
      description:
        "Projet pédagogique classique couvrant un semestre avec plusieurs livrables.",
      durationWeeks: 12,
    },
    {
      id: 'annuel',
      label: 'Projet annuel (24 semaines)',
      description:
        "Projet long terme pour accompagner une promotion tout au long de l\'année.",
      durationWeeks: 24,
    },
  ];

  useEffect(() => {
    if (step === 2 && groups.length === 0) {
      loadGroups();
    }
  }, [step]);

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      const data = await groupService.getGroups();
      setGroups(data || []);
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const applyTemplate = (template) => {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7
    );
    const end = new Date(start);
    end.setDate(start.getDate() + template.durationWeeks * 7);

    const toInputDate = (d) => d.toISOString().split('T')[0];

    setFormData((prev) => ({
      ...prev,
      nom: prev.nom || template.label,
      description:
        prev.description ||
        `${template.description} Définissez les objectifs précis, les livrables attendus et les critères d'évaluation.`,
      dateDebut: toInputDate(start),
      dateFin: toInputDate(end),
    }));

    // Réinitialiser les erreurs liées aux dates si un modèle est appliqué
    setErrors((prev) => ({
      ...prev,
      dateDebut: '',
      dateFin: '',
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du projet est requis';
    } else if (formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
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
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      onCancel();
      return;
    }
    setStep((prev) => prev - 1);
  };

  const toggleGroupSelection = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const success = await onSubmit({
        ...formData,
        dateDebut: new Date(formData.dateDebut).toISOString(),
        dateFin: new Date(formData.dateFin).toISOString(),
      }, selectedGroupIds);

      if (success) {
        // La navigation est gérée par le parent
      }
    } catch (error) {
      console.error('Erreur création projet via wizard:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getProjectDurationDays = () => {
    if (!formData.dateDebut || !formData.dateFin) return 0;
    const start = new Date(formData.dateDebut);
    const end = new Date(formData.dateFin);
    const diffTime = end - start;
    if (diffTime <= 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getOverlappingProjectsCount = () => {
    if (!formData.dateDebut || !formData.dateFin || !existingProjects.length) {
      return 0;
    }

    const start = new Date(formData.dateDebut);
    const end = new Date(formData.dateFin);

    return existingProjects.filter((p) => {
      if (!p.dateDebut || !p.dateFin) return false;
      const pStart = new Date(p.dateDebut);
      const pEnd = new Date(p.dateFin);
      return pStart <= end && pEnd >= start;
    }).length;
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="wizard-step">
          <h2>Informations du projet</h2>
          <p>Définissez les informations principales de votre projet.</p>

          <div className="templates-row">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className="template-card"
                onClick={() => applyTemplate(template)}
              >
                <div className="template-title">{template.label}</div>
                <div className="template-description">{template.description}</div>
              </button>
            ))}
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="nom">Nom du projet *</label>
              <input
                id="nom"
                type="text"
                className={`form-input ${errors.nom ? 'error' : ''}`}
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                placeholder="Ex: Application Web de Gestion"
              />
              {errors.nom && <div className="form-error">{errors.nom}</div>}
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="description">Description *</label>
              <textarea
                id="description"
                className={`form-input ${errors.description ? 'error' : ''}`}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="4"
                placeholder="Décrivez les objectifs, le contexte et les attentes du projet..."
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dateDebut">Date de début *</label>
              <input
                id="dateDebut"
                type="date"
                className={`form-input ${errors.dateDebut ? 'error' : ''}`}
                value={formData.dateDebut}
                onChange={(e) => handleChange('dateDebut', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dateDebut && <div className="form-error">{errors.dateDebut}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dateFin">Date de fin *</label>
              <input
                id="dateFin"
                type="date"
                className={`form-input ${errors.dateFin ? 'error' : ''}`}
                value={formData.dateFin}
                onChange={(e) => handleChange('dateFin', e.target.value)}
                min={formData.dateDebut || new Date().toISOString().split('T')[0]}
              />
              {errors.dateFin && <div className="form-error">{errors.dateFin}</div>}
              {formData.dateDebut && formData.dateFin && (
                <div className="form-info small">
                  <i className="fas fa-calendar"></i>
                  <span>
                    Durée estimée : {getProjectDurationDays()} jour
                    {getProjectDurationDays() > 1 ? 's' : ''}
                  </span>
                  {getOverlappingProjectsCount() > 0 && (
                    <span className="calendar-warning">
                       a0 b7 {getOverlappingProjectsCount()} autre(s) projet(s) prévus sur cette période
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="wizard-step">
          <h2>Groupes existants</h2>
          <p>Sélectionnez les groupes qui participeront à ce projet.</p>

          {groups.length > 0 && (
            <div className="groups-suggestions-bar">
              <span className="suggestion-label">Suggestions rapides :</span>
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={() =>
                  setSelectedGroupIds(groups.map((g) => g.id || g._id))
                }
              >
                Sélectionner tous les groupes
              </button>
              {groups.length > 3 && (
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={() =>
                    setSelectedGroupIds(
                      groups
                        .slice(0, 3)
                        .map((g) => g.id || g._id)
                    )
                  }
                >
                  Projet pilote (3 groupes)
                </button>
              )}
            </div>
          )}

          {loadingGroups ? (
            <div className="wizard-loading">
              <LoadingSpinner />
              <p>Chargement des groupes...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="wizard-empty">
              <p>Aucun groupe disponible pour le moment.</p>
              <p>Vous pourrez toujours associer des groupes plus tard.</p>
            </div>
          ) : (
            <div className="groups-grid">
              {groups.map((group) => (
                <button
                  key={group.id || group._id}
                  type="button"
                  className={`group-select-card ${selectedGroupIds.includes(group.id || group._id) ? 'selected' : ''}`}
                  onClick={() => toggleGroupSelection(group.id || group._id)}
                >
                  <div className="group-select-header">
                    <h3>{group.nom}</h3>
                    {selectedGroupIds.includes(group.id || group._id) && (
                      <span className="group-selected-badge">Sélectionné</span>
                    )}
                  </div>
                  {group.description && (
                    <p className="group-select-description">{group.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="wizard-step">
        <h2>Récapitulatif</h2>
        <p>Vérifiez les informations avant de créer le projet.</p>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Informations du projet</h3>
            <ul>
              <li><strong>Nom :</strong> {formData.nom}</li>
              <li><strong>Description :</strong> {formData.description}</li>
              <li><strong>Date de début :</strong> {formData.dateDebut}</li>
              <li><strong>Date de fin :</strong> {formData.dateFin}</li>
            </ul>
          </div>

          <div className="summary-card">
            <h3>Groupes associés</h3>
            {selectedGroupIds.length === 0 ? (
              <p>Aucun groupe sélectionné. Vous pourrez en ajouter plus tard.</p>
            ) : (
              <ul>
                {groups
                  .filter((g) => selectedGroupIds.includes(g.id || g._id))
                  .map((g) => (
                    <li key={g.id || g._id}>{g.nom}</li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="project-form-page project-wizard-page">
      <div className="form-header">
        <h1>Créer un projet avec groupes</h1>
        <p>Suivez les étapes pour configurer rapidement votre projet et l'associer à des groupes existants.</p>
      </div>

      <div className="wizard-steps-indicator">
        <div className={`wizard-step-indicator ${step === 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Informations</span>
        </div>
        <div className={`wizard-step-indicator ${step === 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Groupes</span>
        </div>
        <div className={`wizard-step-indicator ${step === 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Récapitulatif</span>
        </div>
      </div>

      <div className="project-form wizard-container">
        {renderStepContent()}

        <div className="wizard-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={submitting}
          >
            {step === 1 ? 'Annuler' : 'Précédent'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={submitting}
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Création en cours...' : 'Créer le projet'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCreationWizard;
