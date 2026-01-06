import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../UI/LoadingSpinner';
import ConfirmationModal from '../../../Common/ConfirmationModal';
import StudentSelector from './StudentSelector';

const GroupEditModal = ({
  group,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddStudent,
  onRemoveStudent,
  onCalculateProgress,
  allStudents = []
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Initialiser les données du groupe
  useEffect(() => {
    if (group && isOpen) {
      setFormData({
        nom: group.nom || '',
        description: group.description || ''
      });
      setErrors({});
      setActiveTab('general');
    }
  }, [group, isOpen]);

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
      const success = await onEdit(group.id, formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erreur modification groupe:', error);
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

  const handleAddStudentToGroup = async (studentId) => {
    const maxMembers = group.maxMembers || 5;
    if ((group.etudiants?.length || 0) >= maxMembers) {
      setErrors(prev => ({ ...prev, addStudent: `Capacité maximale du groupe atteinte (${maxMembers} membres).` }));
      return;
    }
    setStudentsLoading(true);
    try {
      const success = await onAddStudent(group.id, studentId);
      if (success) {
        setActiveModal(null);
        setErrors(prev => ({ ...prev, addStudent: undefined }));
      }
    } catch (error) {
      console.error('Erreur ajout étudiant:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleRemoveStudentFromGroup = async (studentId) => {
    setStudentsLoading(true);
    try {
      const success = await onRemoveStudent(group.id, studentId);
      if (success) {
        setActiveModal(null);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Erreur retrait étudiant:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleCalculateGroupProgress = async () => {
    setLoading(true);
    try {
      await onCalculateProgress(group.id);
    } catch (error) {
      console.error('Erreur calcul avancement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setLoading(true);
    try {
      const success = await onDelete(group.id);
      if (success) {
        setActiveModal(null);
        onClose();
      }
    } catch (error) {
      console.error('Erreur suppression groupe:', error);
    } finally {
      setLoading(false);
    }
  };

  // Étudiants disponibles (non assignés à ce groupe)
  const availableStudents = allStudents.filter(student => 
    !group.etudiants?.some(etudiant => etudiant.id === student.id)
  );

  if (!isOpen || !group) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container large">
        {/* En-tête du modal */}
        <div className="modal-header">
          <div className="header-content">
            <h2>Modifier le groupe</h2>
            <p>Gérez les informations et les membres du groupe</p>
          </div>
          <button
            className="btn btn-icon btn-close"
            onClick={onClose}
            disabled={loading}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Navigation par onglets */}
        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="fas fa-cog"></i>
            Informations générales
          </button>
          <button
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <i className="fas fa-user-graduate"></i>
            Étudiants ({group.etudiants?.length || 0})
          </button>
          <button
            className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <i className="fas fa-project-diagram"></i>
            Projets ({group.projets?.length || 0})
          </button>
        </div>

        {/* Contenu du modal */}
        <div className="modal-content">
          {/* Onglet Informations générales */}
          {activeTab === 'general' && (
            <div className="tab-content">
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
                </div>

                {/* Statistiques du groupe */}
                <div className="group-stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Date de création</div>
                    <div className="stat-value">
                      {group.dateCreation ? new Date(group.dateCreation).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                    </div>
                  </div>                    
                  <div className="stat-item">
                    <div className="stat-label">Statut</div>
                    <div className={`status-badge ${group.statut === 'ACTIF' ? 'active' : 'inactive'}`}>
                      {group.statut === 'ACTIF' ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <div className="actions-left">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCalculateGroupProgress}
                      disabled={loading}
                    >
                      <i className="fas fa-calculator"></i>
                      Calculer l'avancement
                    </button>
                  </div>
                  <div className="actions-right">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setActiveModal('delete')}
                      disabled={loading}
                    >
                      <i className="fas fa-trash"></i>
                      Supprimer
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={onClose}
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
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Onglet Étudiants */}
          {activeTab === 'students' && (
            <div className="tab-content">
              <div className="students-header">
                <div className="header-info">
                  <h3>Gestion des étudiants</h3>
                  <p>
                    {group.etudiants?.length || 0} étudiant(s) dans ce groupe · 
                    {availableStudents.length} étudiant(s) disponible(s)
                  </p>
                  <p>
                    Capacité maximale : {group.maxMembers || 5}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveModal('addStudent')}
                  disabled={studentsLoading || availableStudents.length === 0 || ((group.etudiants && group.maxMembers) ? group.etudiants.length >= group.maxMembers : group.etudiants?.length >= 5)}
                >
                  <i className="fas fa-plus"></i>
                  Ajouter un étudiant
                </button>
              </div>
              {errors.addStudent && (
                <div className="form-error" style={{marginBottom: '16px'}}>{errors.addStudent}</div>
              )}

              {/* Liste des étudiants du groupe */}
              <div className="students-list">
                {group.etudiants && group.etudiants.length > 0 ? (
                  group.etudiants.map((etudiant, idx) => (
                    <div key={etudiant.id} className="student-card">
                      <div className="student-info">
                        <div className="student-avatar">
                          {etudiant.prenom?.[0]}{etudiant.nom?.[0]}
                        </div>
                        <div className="student-details">
                          <div className="student-name">
                            {etudiant.prenom} {etudiant.nom}
                          </div>
                          <div className="student-email">
                            {etudiant.email}
                          </div>
                        </div>
                      </div>
                      <div className="student-actions">
                        <button
                          className="btn btn-icon btn-danger"
                          onClick={() => {
                            setSelectedStudent(etudiant);
                            setActiveModal('removeStudent');
                          }}
                          disabled={studentsLoading}
                          title="Retirer du groupe"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-user-graduate"></i>
                    <h4>Aucun étudiant dans ce groupe</h4>
                    <p>Ajoutez des étudiants pour commencer à travailler sur des projets</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Projets */}
          {activeTab === 'projects' && (
            <div className="tab-content">
              <div className="projects-header">
                <h3>Projets associés</h3>
                <p>Projets sur lesquels ce groupe travaille</p>
              </div>

              <div className="projects-list">
                {group.projets && group.projets.length > 0 ? (
                  group.projets.map((projet) => (
                    <div key={projet.id} className="project-card">
                      <div className="project-info">
                        <h4 className="project-title">{projet.nom}</h4>
                        <p className="project-description">
                          {projet.description || 'Aucune description'}
                        </p>
                        <div className="project-meta">
                          <span className="project-date">
                            <i className="fas fa-calendar"></i>
                            {projet.dateDebut ? new Date(projet.dateDebut).toLocaleDateString('fr-FR') : 'Date non définie'}
                          </span>
                          <span className={`project-status ${projet.statut?.toLowerCase() || 'inconnu'}`}>
                            {projet.statut || 'Statut inconnu'}
                          </span>
                        </div>
                      </div>
                      <div className="project-actions">
                        <button className="btn btn-text">
                          <i className="fas fa-external-link-alt"></i>
                          Voir
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-project-diagram"></i>
                    <h4>Aucun projet associé</h4>
                    <p>Ce groupe ne travaille sur aucun projet pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modals secondaires */}

        {/* Modal d'ajout d'étudiant */}
        {activeModal === 'addStudent' && (
          <StudentSelector
            students={availableStudents}
            onSelect={handleAddStudentToGroup}
            onClose={() => setActiveModal(null)}
            title="Ajouter un étudiant au groupe"
            loading={studentsLoading}
          />
        )}

        {/* Modal de confirmation de retrait d'étudiant */}
        {activeModal === 'removeStudent' && selectedStudent && (
          <ConfirmationModal
            isOpen={true}
            onClose={() => {
              setActiveModal(null);
              setSelectedStudent(null);
            }}
            onConfirm={() => handleRemoveStudentFromGroup(selectedStudent.id)}
            title="Retirer l'étudiant du groupe"
            message={
              <>
                <p>
                  Êtes-vous sûr de vouloir retirer <strong>{selectedStudent.prenom} {selectedStudent.nom}</strong> du groupe ?
                </p>
                <p className="warning-text">
                  <i className="fas fa-exclamation-triangle"></i>
                  L'étudiant perdra l'accès aux projets du groupe.
                </p>
              </>
            }
            confirmText="Retirer du groupe"
            cancelText="Annuler"
            type="warning"
            loading={studentsLoading}
          />
        )}

        {/* Modal de confirmation de suppression du groupe */}
        {activeModal === 'delete' && (
          <ConfirmationModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onConfirm={handleDeleteGroup}
            title="Supprimer le groupe"
            message={
              <>
                <p>
                  Êtes-vous sûr de vouloir supprimer le groupe <strong>"{group.nom}"</strong> ?
                </p>
                <p className="warning-text">
                  <i className="fas fa-exclamation-triangle"></i>
                  Cette action est irréversible. 
                  {(group.etudiants?.length || 0) > 0 && 
                    ` Les ${group.etudiants.length} étudiant(s) seront retirés du groupe.`
                  }
                  {(group.projets?.length || 0) > 0 && 
                    ` Les ${group.projets.length} projet(s) associés seront affectés.`
                  }
                </p>
              </>
            }
            confirmText="Supprimer le groupe"
            cancelText="Annuler"
            type="danger"
            loading={loading}
          />
        )}

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

          .modal-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
          }

          .modal-container.large {
            max-width: 900px;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 24px;
            border-bottom: 1px solid #e5e7eb;
          }

          .header-content h2 {
            margin: 0 0 4px 0;
            color: #1f2937;
            font-size: 1.5rem;
            font-weight: 600;
          }

          .header-content p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
          }

          .modal-tabs {
            display: flex;
            padding: 0 24px;
            border-bottom: 1px solid #e5e7eb;
            background: #f8fafc;
          }

          .tab-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 16px 20px;
            background: none;
            border: none;
            color: #6b7280;
            font-size: 0.9rem;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
          }

          .tab-button:hover {
            color: #374151;
            background: #f1f5f9;
          }

          .tab-button.active {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
            background: white;
          }

          .modal-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }

          .tab-content {
            animation: fadeIn 0.2s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .group-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 24px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .stat-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .stat-label {
            font-size: 0.8rem;
            color: #6b7280;
            font-weight: 500;
          }

          .stat-value {
            font-size: 0.9rem;
            color: #1f2937;
            font-weight: 600;
          }

          .progress-container {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .progress-bar {
            flex: 1;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: #10b981;
            border-radius: 4px;
            transition: width 0.3s ease;
          }

          .progress-text {
            font-size: 0.8rem;
            color: #6b7280;
            min-width: 40px;
          }

          .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .status-badge.active {
            background: #d1fae5;
            color: #065f46;
          }

          .status-badge.inactive {
            background: #fef3c7;
            color: #92400e;
          }

          .form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }

          .actions-left,
          .actions-right {
            display: flex;
            gap: 12px;
          }

          .students-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
          }

          .header-info h3 {
            margin: 0 0 4px 0;
            color: #1f2937;
          }

          .header-info p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
          }

          .students-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .student-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            transition: all 0.2s ease;
          }

          .student-card:hover {
            background: #f1f5f9;
            transform: translateY(-1px);
          }

          .student-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .student-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.9rem;
          }

          .student-name {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 2px;
          }

          .student-email {
            font-size: 0.8rem;
            color: #6b7280;
          }

          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
            color: #6b7280;
          }

          .empty-state i {
            font-size: 3rem;
            margin-bottom: 16px;
            color: #d1d5db;
          }

          .empty-state h4 {
            margin: 0 0 8px 0;
            color: #374151;
          }

          .empty-state p {
            margin: 0;
            font-size: 0.9rem;
          }

          .projects-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .project-card {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .project-title {
            margin: 0 0 8px 0;
            color: #1f2937;
            font-size: 1.1rem;
          }

          .project-description {
            margin: 0 0 12px 0;
            color: #6b7280;
            font-size: 0.9rem;
            line-height: 1.4;
          }

          .project-meta {
            display: flex;
            gap: 16px;
            font-size: 0.8rem;
          }

          .project-date {
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .project-status {
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 500;
          }

          .project-status.actif {
            background: #d1fae5;
            color: #065f46;
          }

          .project-status.terminé {
            background: #e0e7ff;
            color: #3730a3;
          }

          .project-status.en_cours {
            background: #fef3c7;
            color: #92400e;
          }

          .project-status.inconnu {
            background: #f3f4f6;
            color: #6b7280;
          }

          @media (max-width: 768px) {
            .modal-container {
              margin: 0;
              max-height: 100vh;
              border-radius: 0;
            }

            .modal-header {
              padding: 20px;
            }

            .modal-tabs {
              padding: 0 20px;
              overflow-x: auto;
            }

            .modal-content {
              padding: 20px;
            }

            .form-actions {
              flex-direction: column;
              align-items: stretch;
            }

            .actions-left,
            .actions-right {
              justify-content: stretch;
            }

            .actions-left .btn,
            .actions-right .btn {
              flex: 1;
            }

            .students-header {
              flex-direction: column;
              align-items: stretch;
              gap: 16px;
            }

            .group-stats-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GroupEditModal;