import React, { useState, useEffect } from 'react';
import UserSelector from '../../../Common/UserSelector';
import LoadingSpinner from '../../../UI/LoadingSpinner';
// import { userService } from '../../../../services/userService';

const TaskForm = ({ project, onSubmit, onCancel, task, mode = 'create' }) => {
      // Limite de tâches par jour (modifiable)
      const MAX_TASKS_PER_DAY = 3;
      const isTaskLimitReached = () => {
        if (!project?.taches || !formData.dateDebut) return false;
        const currentId = task?.id || task?._id;
        const count = project.taches.filter(t =>
          t.id !== currentId &&
          t.dateDebut && t.dateDebut.slice(0, 10) === formData.dateDebut
        ).length;
        return count >= MAX_TASKS_PER_DAY;
      };
    // Vérifie s'il existe une autre tâche avec la même période (exacte)
    const isExactPeriodDuplicate = () => {
      if (!project?.taches || !formData.dateDebut || !formData.dateEcheance) return false;
      const currentId = task?.id || task?._id;
      return project.taches.some(t =>
        t.id !== currentId &&
        t.dateDebut && t.dateEcheance &&
        t.dateDebut.slice(0, 10) === formData.dateDebut &&
        t.dateEcheance.slice(0, 10) === formData.dateEcheance
      );
    };
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    priorite: 'MOYENNE',
    dateDebut: '',
    dateEcheance: '',
    assignesA: []
  });
  const [assignees, setAssignees] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  // const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    // Préparer la liste des groupes et membres du projet pour l'assignation
    let assigneeOptions = [];
    if (project?.groupes && Array.isArray(project.groupes)) {
      project.groupes.forEach(groupe => {
        assigneeOptions.push({
          id: `groupe-${groupe.id || groupe._id}`,
          label: `Groupe : ${groupe.nom}`,
          type: 'groupe',
          groupeNom: groupe.nom,
          value: { groupeId: groupe.id || groupe._id }
        });
        if (groupe.membres && Array.isArray(groupe.membres)) {
          groupe.membres.forEach(membre => {
            assigneeOptions.push({
              id: `membre-${membre.id || membre._id}`,
              label: `${membre.nom} ${membre.prenom ? membre.prenom : ''} (Groupe : ${groupe.nom})`,
              type: 'membre',
              groupeNom: groupe.nom,
              value: { userId: membre.id || membre._id, groupeId: groupe.id || groupe._id },
              nom: membre.nom,
              prenom: membre.prenom
            });
          });
        }
      });
    }
    setAssignees(assigneeOptions);

    if (task && mode === 'edit') {
      setFormData({
        titre: task.titre || '',
        description: task.description || '',
        priorite: task.priorite || 'MOYENNE',
        dateDebut: task.dateDebut ? new Date(task.dateDebut).toISOString().split('T')[0] : '',
        dateEcheance: task.dateEcheance ? new Date(task.dateEcheance).toISOString().split('T')[0] : '',
        assignesA: task.assignesA || []
      });
    } else {
      // Définir la date de début par défaut à la date de début du projet + 1 jour (ou aujourd'hui si non définie)
      let defaultDebut;
      if (project?.dateDebut) {
        let d = new Date(project.dateDebut);
        d.setDate(d.getDate() + 1);
        defaultDebut = d.toISOString().split('T')[0];
      } else {
        defaultDebut = new Date().toISOString().split('T')[0];
      }
      setFormData(prev => ({
        ...prev,
        dateDebut: defaultDebut
      }));
    }
  }, [task, mode, project]);


  // Vérifie si un membre sélectionné a déjà une tâche sur la même période
  const getOverlappingAssignees = () => {
    if (!project?.taches || !formData.dateDebut || !formData.dateEcheance || !formData.assignesA?.length) return [];
    const currentId = task?.id || task?._id;
    const selectedUserIds = formData.assignesA
      .filter(a => a.type === 'membre')
      .map(a => a.value.userId);
    if (!selectedUserIds.length) return [];
    // Pour chaque tâche du projet (hors tâche courante)
    let overlapping = [];
    project.taches.forEach(t => {
      if (t.id === currentId) return;
      if (!t.dateDebut || !t.dateEcheance || !Array.isArray(t.assignesA)) return;
      // Vérifier si la période se chevauche
      const tStart = new Date(t.dateDebut).setHours(0,0,0,0);
      const tEnd = new Date(t.dateEcheance).setHours(0,0,0,0);
      const fStart = new Date(formData.dateDebut).setHours(0,0,0,0);
      const fEnd = new Date(formData.dateEcheance).setHours(0,0,0,0);
      const overlap = (fStart <= tEnd && fEnd >= tStart);
      if (!overlap) return;
      // Pour chaque assigné de la tâche existante
      t.assignesA.forEach(a => {
        if (a.type === 'membre' && selectedUserIds.includes(a.value.userId)) {
          overlapping.push({
            userId: a.value.userId,
            nom: a.nom,
            prenom: a.prenom,
            tacheTitre: t.titre
          });
        }
      });
    });
    return overlapping;
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0,0,0,0); // ignore time for comparison

    // Titre
    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre de la tâche est requis';
    } else if (formData.titre.trim().length < 3) {
      newErrors.titre = 'Le titre doit contenir au moins 3 caractères';
    } else if (project && Array.isArray(project.taches)) {
      // Vérifie unicité du titre (hors tâche courante si édition)
      const titreLower = formData.titre.trim().toLowerCase();
      const currentId = task?.id || task?._id;
      const titreExiste = project.taches.some(t =>
        (t.id !== currentId && t._id !== currentId) &&
        t.titre && t.titre.trim().toLowerCase() === titreLower
      );
      if (titreExiste) {
        newErrors.titre = 'Une tâche avec ce titre existe déjà dans ce projet.';
      }
    }

    // Description
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    // Dates
    let dateDebut = formData.dateDebut ? new Date(formData.dateDebut) : null;
    let dateEcheance = formData.dateEcheance ? new Date(formData.dateEcheance) : null;
    if (dateDebut) dateDebut.setHours(0,0,0,0);
    if (dateEcheance) dateEcheance.setHours(0,0,0,0);

    // Dates du projet
    let projectStart = project?.dateDebut ? new Date(project.dateDebut) : null;
    let projectEnd = project?.dateFin ? new Date(project.dateFin) : null;
    if (projectStart) projectStart.setHours(0,0,0,0);
    if (projectEnd) projectEnd.setHours(0,0,0,0);

    if (!formData.dateDebut) {
      newErrors.dateDebut = 'La date de début est requise';
    } else if (dateDebut < today) {
      newErrors.dateDebut = 'La date de début ne peut pas être dans le passé';
    } else if (projectStart && dateDebut < projectStart) {
      newErrors.dateDebut = `La date de début de la tâche ne peut pas être avant le début du projet (${projectStart.toLocaleDateString('fr-FR')})`;
    } else if (projectEnd && dateDebut > projectEnd) {
      newErrors.dateDebut = `La date de début de la tâche ne peut pas être après la fin du projet (${projectEnd.toLocaleDateString('fr-FR')})`;
    }

    if (!formData.dateEcheance) {
      newErrors.dateEcheance = 'La date d\'échéance est requise';
    } else if (dateEcheance < today) {
      newErrors.dateEcheance = 'La date d\'échéance ne peut pas être dans le passé';
    } else if (formData.dateDebut && dateEcheance < dateDebut) {
      newErrors.dateEcheance = 'La date d\'échéance doit être après la date de début';
    } else if (formData.dateDebut && (dateEcheance - dateDebut) / (1000*60*60*24) > 90) {
      newErrors.dateEcheance = 'La durée maximale d\'une tâche est de 90 jours';
    } else if (projectEnd && dateEcheance > projectEnd) {
      newErrors.dateEcheance = `La date d'échéance de la tâche ne peut pas dépasser la date de fin du projet (${projectEnd.toLocaleDateString('fr-FR')})`;
    }

    // Interdire la création de tâches hors période projet
    if (projectStart && projectEnd && (dateDebut < projectStart || dateEcheance > projectEnd)) {
      newErrors.dateDebut = `Les tâches doivent être comprises entre le ${projectStart.toLocaleDateString('fr-FR')} et le ${projectEnd.toLocaleDateString('fr-FR')}`;
    }

    // Vérification de doublon exact de période
    if (isExactPeriodDuplicate()) {
      newErrors.dateDebut = 'Une autre tâche existe déjà avec exactement la même date de début et d\'échéance.';
      newErrors.dateEcheance = 'Une autre tâche existe déjà avec exactement la même date de début et d\'échéance.';
    }


    // Limite du nombre d'assignés (max 5)
    if (!formData.assignesA || formData.assignesA.length === 0) {
      newErrors.assignesA = "Veuillez sélectionner au moins un responsable (groupe ou membre).";
    } else if (formData.assignesA.length > 5) {
      newErrors.assignesA = "Vous ne pouvez pas assigner à plus de 5 responsables.";
    } else {
      // Validation : au moins un membre par groupe
      if (project?.groupes && Array.isArray(project.groupes) && project.groupes.length > 0) {
        const assigneesByGroup = {};
        // Initialiser chaque groupe à 0
        project.groupes.forEach(groupe => {
          assigneesByGroup[groupe.id || groupe._id] = 0;
        });
        // Compter les membres sélectionnés par groupe
        formData.assignesA.forEach(a => {
          if (a.type === 'membre' && a.value && a.value.groupeId) {
            assigneesByGroup[a.value.groupeId] = (assigneesByGroup[a.value.groupeId] || 0) + 1;
          }
        });
        // Vérifier qu'au moins un membre est sélectionné pour chaque groupe
        const groupesSansMembre = Object.entries(assigneesByGroup)
          .filter(([_, count]) => count === 0)
          .map(([groupeId, _]) => {
            const groupe = project.groupes.find(g => (g.id || g._id) === groupeId);
            return groupe ? groupe.nom : groupeId;
          });
        if (groupesSansMembre.length > 0) {
          newErrors.assignesA = `Sélectionnez au moins un membre pour chaque groupe : ${groupesSansMembre.join(', ')}`;
        }
      }
    }

    // Limite de tâches par jour
    if (isTaskLimitReached()) {
      newErrors.dateDebut = `La limite de ${MAX_TASKS_PER_DAY} tâche(s) par jour est atteinte pour cette date.`;
    }

    setErrors(newErrors);
    // Vérification de chevauchement de période pour les membres
    const overlapping = getOverlappingAssignees();
    if (overlapping.length > 0) {
      setOverlapWarning(overlapping);
    } else {
      setOverlapWarning(null);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    // Si chevauchement détecté et pas encore confirmé, demander confirmation
    if (getOverlappingAssignees().length > 0 && !pendingSubmit) {
      setPendingSubmit(true);
      return;
    }
    setLoading(true);
    try {
      // Adapter le mapping des assignés avant envoi
      const mappedAssignesA = (formData.assignesA || [])
        .filter(a => a.type === 'membre' && a.value && a.value.userId)
        .map(a => ({
          id: a.value.userId,
          nom: a.nom,
          prenom: a.prenom
          // ajoute d'autres champs si besoin (email, etc.)
        }));
      const success = await onSubmit({
        ...formData,
        assignesA: mappedAssignesA,
        dateDebut: new Date(formData.dateDebut).toISOString(),
        dateEcheance: new Date(formData.dateEcheance).toISOString()
      });
      if (success) {
        // Le parent gère la navigation
      }
    } catch (error) {
      console.error('Erreur soumission formulaire:', error);
    } finally {
      setLoading(false);
      setPendingSubmit(false);
    }
  };

  // Si l'utilisateur confirme malgré l'avertissement
  const handleConfirmOverlap = () => {
    setPendingSubmit(false);
    setOverlapWarning(null);
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 0);
  };

  // Affiche l'erreur du champ dès qu'on quitte le champ (onBlur)
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Ne pas toucher aux erreurs ici : elles sont gérées uniquement dans handleBlur ou à la soumission
  };

  const handleBlur = (field) => {
    // Validation ciblée du champ quitté
    let newErrors = { ...errors };
    if (field === 'titre') {
      if (!formData.titre.trim()) {
        newErrors.titre = 'Le titre de la tâche est requis';
      } else if (formData.titre.trim().length < 3) {
        newErrors.titre = 'Le titre doit contenir au moins 3 caractères';
      } else if (project && Array.isArray(project.taches)) {
        // Vérifie unicité du titre (hors tâche courante si édition)
        const titreLower = formData.titre.trim().toLowerCase();
        const currentId = task?.id || task?._id;
        const titreExiste = project.taches.some(t =>
          (t.id !== currentId && t._id !== currentId) &&
          t.titre && t.titre.trim().toLowerCase() === titreLower
        );
        console.log('Vérification unicité titre:', formData.titre, 'existe?', titreExiste);
        if (titreExiste) {
          newErrors.titre = 'Une tâche avec ce titre existe déjà dans ce projet.';
        } else {
          newErrors.titre = '';
        }
      } else {
        newErrors.titre = '';
      }
    }
    if (field === 'description') {
      if (!formData.description.trim()) {
        newErrors.description = 'La description est requise';
      } else {
        newErrors.description = '';
      }
    }
    if (field === 'dateDebut' || field === 'dateEcheance') {
      // On ne valide que les dates et règles croisées lors du blur sur un champ date
      // On ne met à jour que les erreurs de date
      const today = new Date();
      today.setHours(0,0,0,0);
      let dateDebut = formData.dateDebut ? new Date(formData.dateDebut) : null;
      let dateEcheance = formData.dateEcheance ? new Date(formData.dateEcheance) : null;
      if (dateDebut) dateDebut.setHours(0,0,0,0);
      if (dateEcheance) dateEcheance.setHours(0,0,0,0);
      let projectStart = project?.dateDebut ? new Date(project.dateDebut) : null;
      let projectEnd = project?.dateFin ? new Date(project.dateFin) : null;
      if (projectStart) projectStart.setHours(0,0,0,0);
      if (projectEnd) projectEnd.setHours(0,0,0,0);
      // Date de début
      if (!formData.dateDebut) {
        newErrors.dateDebut = 'La date de début est requise';
      } else if (dateDebut < today) {
        newErrors.dateDebut = 'La date de début ne peut pas être dans le passé';
      } else if (projectStart && dateDebut < projectStart) {
        newErrors.dateDebut = `La date de début de la tâche ne peut pas être avant le début du projet (${projectStart.toLocaleDateString('fr-FR')})`;
      } else if (projectEnd && dateDebut > projectEnd) {
        newErrors.dateDebut = `La date de début de la tâche ne peut pas être après la fin du projet (${projectEnd.toLocaleDateString('fr-FR')})`;
      } else {
        newErrors.dateDebut = '';
      }
      // Date d'échéance
      if (!formData.dateEcheance) {
        newErrors.dateEcheance = 'La date d\'échéance est requise';
      } else if (dateEcheance < today) {
        newErrors.dateEcheance = 'La date d\'échéance ne peut pas être dans le passé';
      } else if (formData.dateDebut && dateEcheance < dateDebut) {
        newErrors.dateEcheance = 'La date d\'échéance doit être après la date de début';
      } else if (formData.dateDebut && (dateEcheance - dateDebut) / (1000*60*60*24) > 90) {
        newErrors.dateEcheance = 'La durée maximale d\'une tâche est de 90 jours';
      } else if (projectEnd && dateEcheance > projectEnd) {
        newErrors.dateEcheance = `La date d'échéance de la tâche ne peut pas dépasser la date de fin du projet (${projectEnd.toLocaleDateString('fr-FR')})`;
      } else {
        newErrors.dateEcheance = '';
      }
      // Hors période projet
      if (projectStart && projectEnd && (dateDebut < projectStart || dateEcheance > projectEnd)) {
        newErrors.dateDebut = `Les tâches doivent être comprises entre le ${projectStart.toLocaleDateString('fr-FR')} et le ${projectEnd.toLocaleDateString('fr-FR')}`;
      }
      // Doublon exact de période
      if (isExactPeriodDuplicate()) {
        newErrors.dateDebut = 'Une autre tâche existe déjà avec exactement la même date de début et d\'échéance.';
        newErrors.dateEcheance = 'Une autre tâche existe déjà avec exactement la même date de début et d\'échéance.';
      }
      // Limite de tâches par jour
      if (isTaskLimitReached()) {
        newErrors.dateDebut = `La limite de ${MAX_TASKS_PER_DAY} tâche(s) par jour est atteinte pour cette date.`;
      }
    }
    setErrors(newErrors);
    setErrors(newErrors);
  };

  const handleAssigneeChange = (selectedStudents) => {
    handleChange('assignesA', selectedStudents);
  };

  const priorityOptions = [
    { value: 'BASSE', label: 'Basse', color: 'gray', icon: 'arrow-down' },
    { value: 'MOYENNE', label: 'Moyenne', color: 'blue', icon: 'minus' },
    { value: 'HAUTE', label: 'Haute', color: 'orange', icon: 'arrow-up' },
    { value: 'URGENTE', label: 'Urgente', color: 'red', icon: 'exclamation-triangle' }
  ];

  return (
    <div className="project-form-page">
      <div className="form-header">
        <h1>
          {mode === 'create' ? 'Créer une nouvelle tâche' : 'Modifier la tâche'}
        </h1>
        <p>
          {mode === 'create' 
            ? `Ajoutez une tâche au projet "${project?.nom}"`
            : 'Modifiez les informations de la tâche'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-grid">
          {/* Titre de la tâche */}
          <div className="form-group full-width">
            <label htmlFor="titre" className="form-label">
              Titre de la tâche *
            </label>
            <input
              type="text"
              id="titre"
              value={formData.titre}
              onChange={(e) => handleChange('titre', e.target.value)}
              onBlur={() => handleBlur('titre')}
              className={`form-input ${errors.titre ? 'error' : ''}`}
              placeholder="Ex: Conception de la base de données"
              disabled={loading}
            />
            {errors.titre && <div className="form-error">{errors.titre}</div>}
          </div>

          {/* Priorité */}
          <div className="form-group full-width">
            <label className="form-label">
              Priorité *
            </label>
            <div className="priority-grid">
              {priorityOptions.map(option => (
                <label key={option.value} className={`priority-card ${formData.priorite === option.value ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="priorite"
                    value={option.value}
                    checked={formData.priorite === option.value}
                    onChange={(e) => handleChange('priorite', e.target.value)}
                    disabled={loading}
                    className="priority-input"
                  />
                  <div className="priority-content">
                    <div className={`priority-icon priority-${option.color}`}>
                      <i className={`fas fa-${option.icon}`}></i>
                    </div>
                    <div className="priority-info">
                      <div className="priority-label">{option.label}</div>
                    </div>
                  </div>
                </label>
              ))}
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
              onBlur={() => handleBlur('dateDebut')}
              className={`form-input ${errors.dateDebut ? 'error' : ''}`}
              disabled={loading}
              min={(project?.dateDebut ? new Date(project.dateDebut).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])}
              max={project?.dateFin ? new Date(project.dateFin).toISOString().split('T')[0] : undefined}
            />
            {errors.dateDebut && <div className="form-error">{errors.dateDebut}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="dateEcheance" className="form-label">
              Date d'échéance *
            </label>
            <input
              type="date"
              id="dateEcheance"
              value={formData.dateEcheance}
              onChange={(e) => handleChange('dateEcheance', e.target.value)}
              onBlur={() => handleBlur('dateEcheance')}
              className={`form-input ${errors.dateEcheance ? 'error' : ''}`}
              disabled={loading}
              min={formData.dateDebut || (project?.dateDebut ? new Date(project.dateDebut).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])}
              max={project?.dateFin ? new Date(project.dateFin).toISOString().split('T')[0] : undefined}
            />
            {errors.dateEcheance && <div className="form-error">{errors.dateEcheance}</div>}
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              className={`form-input ${errors.description ? 'error' : ''}`}
              placeholder="Décrivez en détail la tâche à réaliser, les objectifs, les contraintes techniques, les livrables attendus..."
              rows="5"
              disabled={loading}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
            <div className="form-hint">
              Une description détaillée aide les étudiants à mieux comprendre les attentes
            </div>
          </div>

          {/* Assignation */}
          <div className="form-group full-width">
            <label htmlFor="assignesA" className="form-label">
              Assigné à (optionnelle) : personne ou groupe responsable
            </label>
            <UserSelector
              users={assignees}
              selectedUsers={formData.assignesA}
              onChange={handleAssigneeChange}
              placeholder="Sélectionnez la personne ou le groupe responsable..."
              disabled={loading}
            />
            {errors.assignesA && <div className="form-error">{errors.assignesA}</div>}
            <div className="form-hint">
              Vous pouvez assigner cette tâche à une ou plusieurs personnes ou groupes responsables du projet (max 5).
            </div>
            {overlapWarning && overlapWarning.length > 0 && pendingSubmit && (
              <div className="form-warning" style={{ background: '#fffbe6', border: '1px solid #ffe58f', color: '#ad8b00', padding: '12px', marginTop: '10px', borderRadius: '4px' }}>
                <strong>Attention :</strong> Les membres suivants ont déjà une tâche sur la même période :
                <ul style={{ margin: '8px 0 0 20px' }}>
                  {overlapWarning.map((m, idx) => (
                    <li key={m.userId + idx}>
                      {m.nom} {m.prenom ? m.prenom : ''} (Tâche : {m.tacheTitre})
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '10px' }}>
                  Voulez-vous continuer malgré tout ?
                  <button type="button" className="btn btn-warning" style={{ marginLeft: '10px' }} onClick={handleConfirmOverlap}>
                    Oui, continuer
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={() => setPendingSubmit(false)}>
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

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
                {mode === 'create' ? 'Créer la tâche' : 'Enregistrer les modifications'}
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
            Conseils pour une bonne tâche
          </h4>
          <ul>
            <li>Donnez un titre clair et explicite</li>
            <li>Définissez des dates réalistes</li>
            <li>Choisissez la priorité en fonction de l'impact</li>
            <li>Décrivez précisément les livrables attendus</li>
            <li>Assignez aux étudiants concernés par le travail</li>
            <li>Prévoyez des étapes intermédiaires si nécessaire</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;