import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { profileService } from '../services/profile';
import { projectService } from '../services/projectService';
import { groupService } from '../services/groupService';
import '../styles/profile.css';
import Sidebar from '../components/Layout/Sidebar';
import ProfileForm from '../components/Profile/ProfileForm';
import AvatarUpload from '../components/Profile/AvatarUpload';
import ChangePassword from '../components/Auth/ChangePassword';
import ConfirmationModal from '../components/Common/ConfirmationModal';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  const handleNavigate = (view) => {
    switch (view) {
      case 'dashboard':
        navigate('/teacher-dashboard');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'groups':
        navigate('/groups');
        break;
      case 'deliverables':
        navigate('/deliverables');
        break;
      case 'statistics':
        navigate('/statistics');
        break;
      case 'all-tasks':
      case 'tasks':
        navigate('/tasks');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'messaging':
        navigate('/messaging');
        break;
      default:
        navigate('/teacher-dashboard');
    }
  };

  const handleProfileUpdate = async (formData) => {
    setLoading(true);
    setMessage('');

    try {
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        numTel: formData.numTel,
        nomFac: formData.nomFac,
        nomDep: formData.nomDep
          ? formData.nomDep
              .split(',')
              .map((d) => d.trim())
              .filter(Boolean)
          : [],
        specialite: formData.specialite,
      };

      const updatedUser = await profileService.updateProfile(updateData);
      updateUser(updatedUser);
      setMessage('✅ Profil mis à jour avec succès');
    } catch (error) {
      setMessage('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    setAvatarLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      // Le backend attend le champ "photo" dans MultipartFile
      formData.append('photo', file);

      const updatedUser = await profileService.uploadAvatar(formData);
      updateUser(updatedUser);
      setMessage('Photo de profil mise à jour');
    } catch (error) {
      setMessage('❌ Erreur: ' + error.message);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Charger les stats de l'enseignant : projets suivis et étudiants encadrés
  useEffect(() => {
    const loadStats = async () => {
      if (!user || user.role !== 'ENSEIGNANT') return;
      try {
        // Projets de l'enseignant
        const teacherProjects = await projectService.getTeacherProjects();
        setProjectCount(Array.isArray(teacherProjects) ? teacherProjects.length : 0);

        // Étudiants encadrés : on les déduit des groupes et de leurs membres
        const groups = await groupService.getGroups();
        const studentIds = new Set();

        for (const g of groups || []) {
          const groupId = g.id || g._id;
          if (!groupId) continue;

          try {
            const groupStudents = await groupService.getGroupStudents(groupId);
            (groupStudents || []).forEach((e) => {
              if (e && (e.id || e.email)) {
                studentIds.add(e.id || e.email);
              }
            });
          } catch (err) {
            console.warn('Erreur chargement étudiants du groupe', groupId, err);
          }
        }

        setStudentCount(studentIds.size);
      } catch (e) {
        console.warn('Impossible de charger les statistiques du profil', e);
      }
    };

    loadStats();
  }, [user]);

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="profile-dashboard profile-layout">
      <div className="profile-main-wrapper">
        <Sidebar
          activeView="profile"
          onNavigate={handleNavigate}
          user={user}
          onLogout={logout}
        />
        <main className="profile-main">
          <div className="profile-container">
            <div className="page-header sticky-header profile-page-header">
              <div>
                <h1>Mon Profil</h1>
                <p>Gérez vos informations personnelles et votre compte</p>
              </div>
            </div>

            <details className="profile-collapsible" open>
              <summary className="profile-summary">Informations du compte</summary>
              <div className="row profile-content-row">
                {/* Sidebar Profil avec AvatarUpload */}
                <div className="col-3 profile-sidebar-col">
                  <div className="card profile-sidebar">
                    <div className="profile-avatar-section text-center">
                      <AvatarUpload
                        currentAvatar={user.urlPhotoProfil}
                        onAvatarUpload={handleAvatarUpload}
                        isLoading={avatarLoading}
                      />
                      <h3>
                        {user.prenom} {user.nom}
                      </h3>
                      <p className="user-role">
                        <span
                          className={`badge ${
                            user.role === 'ENSEIGNANT' ? 'badge-primary' : 'badge-success'
                          }`}
                        >
                          {user.role === 'ENSEIGNANT' ? (
                            <>
                              <i className="fas fa-chalkboard-teacher" /> Enseignant
                            </>
                          ) : (
                            <>
                              <i className="fas fa-user-graduate" /> Étudiant
                            </>
                          )}
                        </span>
                      </p>
                      <p className="user-email">
                        <i className="fas fa-envelope" /> {user.email}
                      </p>
                      {user.nomFac && (
                        <p className="user-meta">
                          <i className="fas fa-university" /> {user.nomFac}
                        </p>
                      )}
                      {user.nomDep && (
                        <p className="user-meta">
                          <i className="fas fa-layer-group" />{' '}
                          {Array.isArray(user.nomDep) ? user.nomDep.join(', ') : user.nomDep}
                        </p>
                      )}
                      {user.role === 'ENSEIGNANT' && user.specialite && (
                        <p className="user-meta">
                          <i className="fas fa-chalkboard-teacher" /> {user.specialite}
                        </p>
                      )}
                    </div>
                    <div className="profile-stats">
                      <div className="profile-stat">
                        <div className="profile-stat-icon">
                          <i className="fas fa-folder-open" />
                        </div>
                        <div className="stat-number">{projectCount}</div>
                        <div className="stat-label">Projets suivis</div>
                      </div>
                      <div className="profile-stat">
                        <div className="profile-stat-icon">
                          <i className="fas fa-user-graduate" />
                        </div>
                        <div className="stat-number">{studentCount}</div>
                        <div className="stat-label">Étudiants encadrés</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu Principal */}
                <div className="col-9 profile-content-col">
                  <div className="card profile-main-card">
                    <div className="tab-navigation">
                      <button
                        className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                      >
                        <i className="fas fa-id-card" /> Informations personnelles
                      </button>
                      <button
                        className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                      >
                        <i className="fas fa-shield-alt" /> Sécurité du compte
                      </button>
                    </div>

                    <div className="tab-content p-2">
                      {message && (
                        <div
                          className={`alert ${
                            message.includes('✅') ? 'alert-success' : 'alert-danger'
                          }`}
                        >
                          {message}
                        </div>
                      )}

                      {/* Tab Informations personnelles */}
                      {activeTab === 'info' && (
                        <ProfileForm user={user} onUpdate={handleProfileUpdate} isLoading={loading} />
                      )}

                      {/* Tab Sécurité */}
                      {activeTab === 'security' && (
                        <div className="security-section">
                          <div className="security-header">
                            <h4>
                              <i className="fas fa-shield-alt" /> Sécurité du compte
                            </h4>
                            <p>
                              Renforcez la protection de votre compte en mettant régulièrement
                              votre mot de passe à jour.
                            </p>
                          </div>

                          <div className="security-layout">
                            <div className="security-form-card">
                              <p className="security-intro">
                                Pour modifier votre mot de passe, ouvrez la fenêtre sécurisée de
                                changement de mot de passe. Toutes les vérifications de sécurité
                                y seront appliquées automatiquement.
                              </p>
                              <div className="security-actions">
                                <button
                                  type="button"
                                  className="btn btn-primary security-submit-btn"
                                  onClick={() => setIsChangePasswordOpen(true)}
                                >
                                  <i className="fas fa-key" /> Changer mon mot de passe
                                </button>
                              </div>
                            </div>

                            <div className="security-side-card">
                              <h5>
                                <i className="fas fa-lightbulb" /> Bonnes pratiques de sécurité
                              </h5>
                              <ul>
                                <li>
                                  Utilisez au moins 8 caractères avec lettres, chiffres et
                                  symboles.
                                </li>
                                <li>
                                  Évitez de réutiliser le même mot de passe sur plusieurs sites.
                                </li>
                                <li>
                                  Ne partagez jamais votre mot de passe par email ou message.
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="danger-zone">
                            <div className="danger-zone-header">
                              <span className="danger-icon">
                                <i className="fas fa-exclamation-triangle" />
                              </span>
                              <div>
                                <h4>Zone sensible : suppression du compte</h4>
                                <p>
                                  La suppression de votre compte est définitive et entraînera la
                                  perte de toutes vos données associées.
                                </p>
                              </div>
                            </div>
                            <div className="danger-actions">
                              <button
                                className="btn btn-outline btn-danger-ghost"
                                onClick={() => setIsDeleteModalOpen(true)}
                              >
                                <i className="fas fa-trash" /> Supprimer définitivement mon compte
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </main>
      </div>
      <ChangePassword
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setMessage('🔧 Suppression de compte à implémenter');
        }}
        title="Supprimer définitivement votre compte"
        message={
          "Êtes-vous sûr de vouloir supprimer votre compte ?\n" +
          "Cette action est irréversible et entraînera la suppression de toutes vos données."
        }
        confirmText="Oui, supprimer mon compte"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
};

export default Profile;