import React, { useState, useEffect } from "react";
import { deliverableService } from '../../../../services/deliverableService';
import ConfirmationModal from '../../../Common/ConfirmationModal';
import { projectService } from '../../../../services/projectService';
import { groupService } from '../../../../services/groupService';
import UserSelector from '../../../Common/UserSelector';
import StatusBadge from "../../../Common/StatusBadge";
import PriorityBadge from "../../../Common/PriorityBadge";

const TaskCard = ({ task, onStatusChange, onSelect, showProject = false, project, onEdit, onDelete }) => {
    // console.log('TaskCard:', task.titre, 'pourcentageAvancement:', task.pourcentageAvancement, typeof task.pourcentageAvancement);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentMessage, setAttachmentMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
          // Charger la liste des fichiers joints lors de l'ouverture du modal
          useEffect(() => {
            const fetchFiles = async () => {
              if (showAttachmentModal && task.livrableAssocie && task.livrableAssocie.id) {
                setFilesLoading(true);
                try {
                  const files = await deliverableService.getDeliverableFiles(task.livrableAssocie.id);
                  setAttachedFiles(files);
                } catch (e) {
                  setAttachedFiles([]);
                } finally {
                  setFilesLoading(false);
                }
              }
            };
            fetchFiles();
          }, [showAttachmentModal, task.livrableAssocie]);
      // Gestion upload pièce jointe
      const handleAttachmentUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !task.livrableAssocie || !task.livrableAssocie.id) {
          setAttachmentMessage("Veuillez sélectionner un fichier et vérifier le livrable associé.");
          return;
        }
        setAttachmentLoading(true);
        setAttachmentMessage("");
        try {
          await deliverableService.submitDeliverable(task.livrableAssocie.id, selectedFile);
          setAttachmentMessage("✅ Pièce jointe envoyée avec succès.");
          setSelectedFile(null);
          // Recharger la liste des fichiers après upload
          if (task.livrableAssocie && task.livrableAssocie.id) {
            const files = await deliverableService.getDeliverableFiles(task.livrableAssocie.id);
            setAttachedFiles(files);
          }
        } catch (error) {
          setAttachmentMessage("❌ Erreur lors de l'envoi : " + (error.message || ""));
        } finally {
          setAttachmentLoading(false);
        }
      };
  // Fermer tous les autres modaux lors de la demande de suppression
  const handleAskDelete = (e) => {
    e.stopPropagation();
    setShowEditModal(false);
    setShowDeleteModal(true);
  };


    const [editValues, setEditValues] = useState({
      titre: task.titre,
      description: task.description || '',
      priorite: task.priorite || 'MOYENNE',
      dateEcheance: task.dateEcheance ? task.dateEcheance.slice(0, 10) : '',
      dateDebut: task.dateDebut ? task.dateDebut.slice(0, 10) : '',
      assignesA: Array.isArray(task.assignesA) ? task.assignesA : []
    });
    // Suppression de la logique d'assignation dynamique (plus de assigneeOptions)
    const [editErrors, setEditErrors] = useState({});
    const [editOverlapWarning, setEditOverlapWarning] = useState(null);
    const [editPendingSubmit, setEditPendingSubmit] = useState(false);
      // Helper: get overlapping assignees for edit modal
      const getEditOverlappingAssignees = () => {
        if (!project?.taches || !editValues.dateDebut || !editValues.dateEcheance || !editValues.assignesA?.length) return [];
        const currentId = task?.id || task?._id;
        const selectedUserIds = editValues.assignesA
          .filter(a => a.type === 'membre')
          .map(a => a.value.userId);
        if (!selectedUserIds.length) return [];
        let overlapping = [];
        project.taches.forEach(t => {
          if (t.id === currentId) return;
          if (!t.dateDebut || !t.dateEcheance || !Array.isArray(t.assignesA)) return;
          const tStart = new Date(t.dateDebut).setHours(0,0,0,0);
          const tEnd = new Date(t.dateEcheance).setHours(0,0,0,0);
          const fStart = new Date(editValues.dateDebut).setHours(0,0,0,0);
          const fEnd = new Date(editValues.dateEcheance).setHours(0,0,0,0);
          const overlap = (fStart <= tEnd && fEnd >= tStart);
          if (!overlap) return;
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

      // Helper: validate edit form (renforcé comme TaskForm)
      const validateEditForm = () => {
        const newErrors = {};
        const today = new Date();
        today.setHours(0,0,0,0);
        // Titre obligatoire, min 3 caractères, unicité dans le projet
        if (!editValues.titre || !editValues.titre.trim()) {
          newErrors.titre = 'Le titre de la tâche est requis';
        } else if (editValues.titre.trim().length < 3) {
          newErrors.titre = 'Le titre doit contenir au moins 3 caractères';
        } else if (project && Array.isArray(project.taches)) {
          const titreLower = editValues.titre.trim().toLowerCase();
          const currentId = task?.id || task?._id;
          const titreExiste = project.taches.some(t =>
            (t.id !== currentId && t._id !== currentId) &&
            t.titre && t.titre.trim().toLowerCase() === titreLower
          );
          if (titreExiste) {
            newErrors.titre = 'Une tâche avec ce titre existe déjà dans ce projet.';
          }
        }
        // Description obligatoire
        if (!editValues.description || !editValues.description.trim()) {
          newErrors.description = 'La description est requise';
        }
        // Dates
        let dateDebut = editValues.dateDebut ? new Date(editValues.dateDebut) : null;
        let dateEcheance = editValues.dateEcheance ? new Date(editValues.dateEcheance) : null;
        if (dateDebut) dateDebut.setHours(0,0,0,0);
        if (dateEcheance) dateEcheance.setHours(0,0,0,0);
        let projectStart = project?.dateDebut ? new Date(project.dateDebut) : null;
        let projectEnd = project?.dateFin ? new Date(project.dateFin) : null;
        if (projectStart) projectStart.setHours(0,0,0,0);
        if (projectEnd) projectEnd.setHours(0,0,0,0);
        if (!editValues.dateDebut) {
          newErrors.dateDebut = 'La date de début est requise';
        } else if (dateDebut < today) {
          newErrors.dateDebut = 'La date de début ne peut pas être dans le passé';
        } else if (projectStart && dateDebut < projectStart) {
          newErrors.dateDebut = `La date de début de la tâche ne peut pas être avant le début du projet (${projectStart.toLocaleDateString('fr-FR')})`;
        } else if (projectEnd && dateDebut > projectEnd) {
          newErrors.dateDebut = `La date de début de la tâche ne peut pas être après la fin du projet (${projectEnd.toLocaleDateString('fr-FR')})`;
        }
        if (!editValues.dateEcheance) {
          newErrors.dateEcheance = 'La date d\'échéance est requise';
        } else if (dateEcheance < today) {
          newErrors.dateEcheance = 'La date d\'échéance ne peut pas être dans le passé';
        } else if (editValues.dateDebut && dateEcheance < dateDebut) {
          newErrors.dateEcheance = 'La date d\'échéance doit être après la date de début';
        } else if (editValues.dateDebut && (dateEcheance - dateDebut) / (1000*60*60*24) > 90) {
          newErrors.dateEcheance = 'La durée maximale d\'une tâche est de 90 jours';
        } else if (projectEnd && dateEcheance > projectEnd) {
          newErrors.dateEcheance = `La date d'échéance de la tâche ne peut pas dépasser la date de fin du projet (${projectEnd.toLocaleDateString('fr-FR')})`;
        }
        // Interdire la création de tâches hors période projet
        if (projectStart && projectEnd && (dateDebut < projectStart || dateEcheance > projectEnd)) {
          newErrors.dateDebut = `Les tâches doivent être comprises entre le ${projectStart.toLocaleDateString('fr-FR')} et le ${projectEnd.toLocaleDateString('fr-FR')}`;
        }
        // Vérification de doublon exact de période
        const isExactPeriodDuplicate = () => {
          if (!project?.taches || !editValues.dateDebut || !editValues.dateEcheance) return false;
          const currentId = task?.id || task?._id;
          return project.taches.some(t =>
            (t.id !== currentId && t._id !== currentId) &&
            t.dateDebut && t.dateEcheance &&
            t.dateDebut.slice(0, 10) === editValues.dateDebut &&
            t.dateEcheance.slice(0, 10) === editValues.dateEcheance
          );
        };
        if (isExactPeriodDuplicate()) {
          newErrors.dateDebut = 'Une autre tâche existe déjà avec exactement la même date de début et d\'échéance.';
          newErrors.dateEcheance = 'Une autre tâche existe déjà avec exactement la même date de début et d\'échéance.';
        }
        // Limite du nombre d'assignés (max 5) et au moins 1 assigné
        if (!editValues.assignesA || editValues.assignesA.length === 0) {
          newErrors.assignesA = "Veuillez sélectionner au moins un responsable (groupe ou membre).";
        } else if (editValues.assignesA.length > 5) {
          newErrors.assignesA = "Vous ne pouvez pas assigner à plus de 5 responsables.";
        } else {
          // Validation : au moins un membre par groupe
          if (project?.groupes && Array.isArray(project.groupes) && project.groupes.length > 0) {
            const assigneesByGroup = {};
            project.groupes.forEach(groupe => {
              assigneesByGroup[groupe.id || groupe._id] = 0;
            });
            editValues.assignesA.forEach(a => {
              if (a.type === 'membre' && a.value && a.value.groupeId) {
                assigneesByGroup[a.value.groupeId] = (assigneesByGroup[a.value.groupeId] || 0) + 1;
              }
            });
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
        // Limite de tâches par jour (max 3 par jour)
        const MAX_TASKS_PER_DAY = 3;
        const isTaskLimitReached = () => {
          if (!project?.taches || !editValues.dateDebut) return false;
          const currentId = task?.id || task?._id;
          const count = project.taches.filter(t =>
            (t.id !== currentId && t._id !== currentId) &&
            t.dateDebut && t.dateDebut.slice(0, 10) === editValues.dateDebut
          ).length;
          return count >= MAX_TASKS_PER_DAY;
        };
        if (isTaskLimitReached()) {
          newErrors.dateDebut = `La limite de ${MAX_TASKS_PER_DAY} tâche(s) par jour est atteinte pour cette date.`;
        }
        setEditErrors(newErrors);
        // Overlap warning
        const overlapping = getEditOverlappingAssignees();
        if (overlapping.length > 0) {
          setEditOverlapWarning(overlapping);
        } else {
          setEditOverlapWarning(null);
        }
        return Object.keys(newErrors).length === 0;
      };
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // REMOVE this duplicate declaration (already declared at the top)

  // Suppression de la logique d'assignation depuis la carte
  const [showDetailModal, setShowDetailModal] = useState(false);

  const {
    id,
    titre,
    description,
    priorite,
    statut: rawStatut,
    dateDebut,
    dateEcheance,
    dateFin,
    assignesA = [],
    groupeId,
  } = task;

  // Toujours garantir un statut valide pour l'affichage et les actions
  const statut = rawStatut && rawStatut !== 'undefined' ? rawStatut : 'A_FAIRE';

  // Find group info if available
  let groupName = null;
  if (project && Array.isArray(project.groupes) && groupeId) {
    const group = project.groupes.find(g => g.id === groupeId);
    if (group) groupName = group.nom;
  }
// Utilitaire pour garantir un pourcentage toujours valide
function safePercent(val, fallback = 0) {
  if (val === undefined || val === null) return fallback;
  const n = Number(val);
  if (typeof n !== 'number' || isNaN(n) || !isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}

  // ...existing code...

  // Defensive: avoid NaN for date and progress
  let isLate = false;
  let formattedEcheance = '—';
  if (dateEcheance) {
    const dateObj = new Date(dateEcheance);
    if (!isNaN(dateObj.getTime())) {
      formattedEcheance = dateObj.toLocaleDateString('fr-FR');
      isLate = dateObj < new Date() && statut !== "TERMINEE";
    }
  }

  // CORRECTION : Progression - gérer undefined/null/NaN et appliquer la règle des 50%
  let progress = 0;
  if (statut === "TERMINEE") {
    progress = 100;
  } else if (statut === "EN_COURS") {
    const pourcentageVal = safePercent(task.pourcentageAvancement);
    if (pourcentageVal === 0 || 
        task.pourcentageAvancement === undefined || 
        task.pourcentageAvancement === null ||
        isNaN(task.pourcentageAvancement)) {
      progress = 50;
    } else {
      progress = pourcentageVal;
    }
  } else {
    progress = safePercent(task.pourcentageAvancement);
  }

  const [errorModal, setErrorModal] = useState(null);
  const handleStatusChange = async (newStatus) => {
    if (isUpdating) return;

    // Contrôle de transition d'état
    // 1. Interdire A_FAIRE -> TERMINEE
    if (statut === "A_FAIRE" && newStatus === "TERMINEE") {
      setErrorModal("Impossible de terminer une tâche qui n'a pas été commencée.");
      return;
    }
    // 2. Interdire EN_COURS -> TERMINEE si aucun assigné
    if (statut === "EN_COURS" && newStatus === "TERMINEE" && (!assignesA || assignesA.length === 0)) {
      setErrorModal("Impossible de terminer une tâche sans assigné.");
      return;
    }

    setIsUpdating(true);
    try {
      // Toujours envoyer un statut valide au backend
      const safeStatus = newStatus && newStatus !== 'undefined' ? newStatus : 'A_FAIRE';
      await onStatusChange(id, safeStatus);
    } catch (error) {
      console.error("Erreur changement statut:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  // Modal d'erreur pour transitions interdites sera rendu dans le return principal

  const getNextStatus = () => {
    const statusFlow = {
      A_FAIRE: "EN_COURS",
      EN_COURS: "TERMINEE",
      TERMINEE: "A_FAIRE",
      EN_RETARD: "EN_COURS",
    };
    return statusFlow[statut] || "A_FAIRE";
  };

  const getStatusButton = () => {
    const nextStatus = getNextStatus();
    const buttonConfigs = {
      A_FAIRE: { label: "Commencer", icon: "fas fa-play", variant: "primary" },
      EN_COURS: { label: "Terminer", icon: "fas fa-check", variant: "success" },
      TERMINEE: {
        label: "Réouvrir",
        icon: "fas fa-redo",
        variant: "secondary",
      },
      EN_RETARD: {
        label: "Commencer",
        icon: "fas fa-play",
        variant: "warning",
      },
    };

    return buttonConfigs[statut] || buttonConfigs["A_FAIRE"];
  };

  const statusButton = getStatusButton();

  // Condition d'activation pour le bouton "Commencer"
  let canStartTask = true;
  let startTaskError = '';
  if (statusButton.label === "Commencer") {
    const today = new Date();
    today.setHours(0,0,0,0);
    let start = dateDebut ? new Date(dateDebut) : null;
    let end = dateEcheance ? new Date(dateEcheance) : null;
    if (start) start.setHours(0,0,0,0);
    if (end) end.setHours(0,0,0,0);
    if ((start && today < start)) {
      canStartTask = false;
      startTaskError = "Vous ne pouvez pas commencer cette tâche avant la date de début.";
    } else if (end && today > end) {
      canStartTask = false;
      startTaskError = "Vous ne pouvez plus commencer cette tâche car la date d'échéance est dépassée.";
    } else if (!(statut === "A_FAIRE" || statut === "EN_RETARD")) {
      canStartTask = false;
      startTaskError = "La tâche n'est pas dans un statut permettant de la commencer.";
    }
  }

  // Affichage moderne avec badge d'échéance, avatars, actions principales visibles, hiérarchie visuelle
  // Détection robuste : non assignée si aucun membre/groupe valide
  const hasValidAssignee = Array.isArray(assignesA) && assignesA.filter(a => a && (a.nom || a.label)).length > 0;
  return (
    <>
      {errorModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 8px 40px #0003', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 18, color: '#ef4444' }}>Action impossible</h3>
            <p>{errorModal}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 28 }}>
              <button className="btn btn-primary" onClick={() => setErrorModal(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`task-card task-card-bordered ${isLate ? "late" : ""} ${statut === "TERMINEE" ? "completed" : ""} ${showProject ? "with-project" : ""}`}
        data-project={showProject ? task.projectName : ""}
        onClick={() => onSelect && onSelect(task)}
        style={{
          boxShadow: !hasValidAssignee ? '0 4px 24px #f59e4233' : '0 2px 8px #0001',
          marginBottom: 24,
          position: 'relative',
          minHeight: 120,
          border: !hasValidAssignee ? '2.5px solid #f59e42' : undefined,
          background: !hasValidAssignee ? 'linear-gradient(90deg, #fff7ed 70%, #fef3c7 100%)' : undefined,
          borderRadius: 18,
          transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
          padding: '1.6rem 2.2rem',
        }}
      >
      {/* Le bouton supprimer est déplacé dans task-actions-minor */}
      {/* Badge d'échéance */}
      <div className={`task-deadline-badge${isLate ? ' late' : ''}`}>
        <i className="fas fa-calendar-alt" style={{ marginRight: 6 }}></i>
        {formattedEcheance}
      </div>

      {showProject && (
        <div className="task-project">
          <i className="fas fa-folder"></i>
          {task.projectName}
        </div>
      )}
      {/* En-tête de la tâche */}
      <div className="task-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div className="task-title-section" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h4 className="task-title" style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
              {titre}
            </h4>
            <button
              className="btn btn-outline-primary btn-sm"
              style={{ fontSize: 13, padding: '2px 12px', borderRadius: 14, border: '1px solid #2563eb', color: '#2563eb', background: 'white', cursor: 'pointer', fontWeight: 600, marginLeft: 2 }}
              title="Voir le détail de la tâche"
              onClick={e => { e.stopPropagation(); setShowDetailModal(true); }}
            >
              Voir détail
            </button>
          </div>
  
      {/* Modal détail tâche */}
      {showDetailModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: 14, padding: 36, minWidth: 360, maxWidth: 540, boxShadow: '0 8px 40px #0003', textAlign: 'left', position: 'relative' }}>
            <button aria-label="Fermer" onClick={() => setShowDetailModal(false)} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 28, color: '#888', cursor: 'pointer' }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 18, color: '#2563eb', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fas fa-tasks" style={{ color: '#2563eb' }}></i> Détail de la tâche
            </h2>
            <div style={{ marginBottom: 18, fontSize: 20, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: 0.2 }}>
              <i className="fas fa-heading" style={{ color: '#6366f1' }}></i> {titre}
            </div>
            <div style={{ marginBottom: 16, color: '#374151', fontSize: 15, background: '#f3f4f6', borderRadius: 8, padding: '10px 14px' }}>
              <i className="fas fa-align-left" style={{ color: '#64748b', marginRight: 6 }}></i>
              <span style={{ fontWeight: 600 }}>Description :</span> {description}
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fas fa-flag" style={{ color: '#f59e42' }}></i>
                <i className="fas fa-flag" style={{ color: '#f59e42' }}></i>
                <PriorityBadge priorite={priorite} />
              </div>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fas fa-signal" style={{ color: '#2563eb' }}></i>
                <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 12, padding: '2px 12px', fontWeight: 700, fontSize: 14 }}>{statut}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fas fa-calendar-plus" style={{ color: '#059669' }}></i> Début : <span style={{ color: '#059669', fontWeight: 700 }}>{dateDebut ? new Date(dateDebut).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
              <div style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fas fa-calendar-check" style={{ color: '#ef4444' }}></i> Échéance : <span style={{ color: '#ef4444', fontWeight: 700 }}>{dateEcheance ? new Date(dateEcheance).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
            </div>
            <div style={{ marginBottom: 16, color: '#0ea5e9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-users" style={{ marginRight: 2 }}></i>Assignés :
              <span style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 6 }}>
                {(assignesA && assignesA.length > 0 && assignesA.filter(a => a && a.nom).length > 0) ? assignesA.filter(a => a && a.nom).map((a, idx) => (
                  <span key={idx} title={a.nom + (a.prenom ? ' ' + a.prenom : '')} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    borderRadius: '18px',
                    minWidth: 32,
                    height: 32,
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: '0 1px 4px #0001',
                    padding: '0 12px',
                    marginRight: 6
                  }}>
                    {a.prenom ? a.prenom.charAt(0) : ''}{a.nom ? a.nom.charAt(0) : ''}
                    <span style={{ marginLeft: 7, fontWeight: 500, fontSize: 13, color: '#0f172a' }}>
                      {a.nom} {a.prenom} {a.groupeNom && (
                        <span style={{ color: '#2563eb', fontWeight: 600, fontSize: 12 }}> (Groupe: {a.groupeNom})</span>
                      )}
                    </span>
                  </span>
                )) : <span style={{ color: '#9ca3af', fontStyle: 'italic', fontWeight: 400 }}>Aucun</span>}
              </span>
            </div>
            <div style={{ marginBottom: 10, color: '#10b981', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-chart-line" style={{ marginRight: 2 }}></i>Progression : <span style={{ color: '#10b981', fontWeight: 700 }}>{progress}%</span>
            </div>
          </div>
        </div>
      )}

          {/* Ajout d'une barre de progression visuelle */}
          <div className="task-progress-bar" style={{ marginTop: 12 }}>
            <div 
              className="progress-bar-background" 
              style={{
                width: '100%',
                height: 8,
                backgroundColor: '#e5e7eb',
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              <div 
                className="progress-bar-fill"
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: progress === 100 ? '#10b981' : 
                                   progress >= 50 ? '#3b82f6' : 
                                   '#f59e0b',
                  borderRadius: 4,
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: 4,
              fontSize: '0.85em',
              color: '#6b7280'
            }}>
              <span>0%</span>
              <span>{progress}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="task-actions">
          <button
            className={`btn btn-${statusButton.variant}`}
            onClick={e => {
              e.stopPropagation();
              if (isUpdating) return;
              if (!canStartTask && statusButton.label === "Commencer") {
                setErrorModal(startTaskError || "Action impossible.");
                return;
              }
              handleStatusChange(getNextStatus());
            }}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className={statusButton.icon}></i>
            )}
            {statusButton.label}
          </button>
        </div>
      </div>
      {/* Description (expandable) */}
      {description && (
        <div className={`task-description ${isExpanded ? "expanded" : ""}`} style={{ marginTop: 8 }}>
          <p style={{ margin: 0, color: '#374151', fontSize: '0.98em', lineHeight: 1.5 }}>{description.length > 180 && !isExpanded ? description.slice(0, 180) + '...' : description}</p>
          {!isExpanded && description.length > 180 && (
            <button
              className="btn btn-text btn-sm"
              onClick={e => { e.stopPropagation(); setIsExpanded(true); }}
            >
              Voir plus
            </button>
          )}
        </div>
      )}
      {/* Assignés (group + member) */}
      <div className="task-assignees" style={{ marginTop: 12 }}>
        <div className="assignees-label" style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.98em', marginBottom: 4 }}>
          <i className="fas fa-user-friends"></i>
          <span style={{ marginLeft: 4 }}>Assigné à :</span>
        </div>
        {hasValidAssignee ? (
          <div className="assignees-list" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {assignesA.slice(0, 3)
              .filter(user => user && (user.prenom || user.nom))
              .map((user, index) => {
                // Chercher le nom du groupe si non présent
                let groupeNom = user.groupeNom;
                if (!groupeNom && user.groupeId && project && Array.isArray(project.groupes)) {
                  const foundGroupe = project.groupes.find(g => g.id === user.groupeId || g._id === user.groupeId);
                  if (foundGroupe) groupeNom = foundGroupe.nom;
                }
                return (
                  <div key={index} className="assignee-avatar" title={user.prenom + ' ' + user.nom}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: '#f1f5f9',
                      borderRadius: 18,
                      padding: '4px 12px 4px 4px',
                      marginRight: 10,
                      boxShadow: '0 1px 4px #0001',
                      minHeight: 36
                    }}>
                    <span style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#38bdf8',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 15,
                      boxShadow: '0 1px 4px #0ea5e933',
                    }}>
                      {user?.prenom ? user.prenom.charAt(0) : ''}{user?.nom ? user.nom.charAt(0) : ''}
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, lineHeight: 1 }}>{user.nom} {user.prenom}</span>
                      {groupeNom && (
                        <span style={{
                          background: '#dbeafe',
                          color: '#2563eb',
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 11,
                          padding: '1px 7px',
                          marginTop: 2,
                          display: 'inline-block',
                          width: 'fit-content'
                        }}>
                          {groupeNom}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            {assignesA.length > 3 && (
              <div className="assignee-more">+{assignesA.length - 3}</div>
            )}
          </div>
        ) : (
          <div style={{
            color: '#b45309',
            background: 'linear-gradient(90deg, #fef3c7 80%, #fde68a 100%)',
            fontStyle: 'italic',
            padding: '1.1em 1.2em',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            borderRadius: 14,
            fontWeight: 700,
            border: '1.5px solid #fde68a',
            marginTop: 8,
            boxShadow: '0 2px 16px #fde68a55',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: 56
          }}>
            <i className="fas fa-exclamation-triangle" style={{ color: '#f59e42', fontSize: 28, marginRight: 2 }}></i>
            <span style={{fontSize: 17, fontWeight: 800, letterSpacing: 0.2}}>Non assignée — à compléter !</span>
          </div>
        )}
        {/* Suppression du modal d'assignation */}
      </div>
      {/* Actions supplémentaires */}
      <div className="task-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div className="task-actions-minor" style={{ display: 'flex', gap: 8 }}>
          <button className="btn-icon" title="Modifier" onClick={e => { e.stopPropagation(); setShowEditModal(true); }}>
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn-icon btn-delete-task"
            title="Supprimer la tâche"
            style={{
              background: 'white',
              border: '1.5px solid #fca5a5',
              color: '#d32f2f',
              fontSize: 17,
              width: 34,
              height: 34,
              padding: 0,
              borderRadius: '50%',
              boxShadow: '0 2px 8px #fca5a555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, box-shadow 0.2s, color 0.2s, border 0.2s',
              cursor: 'pointer',
            }}
            onClick={handleAskDelete}
          >
            <i className="fas fa-trash" style={{ fontSize: 17, margin: 0, padding: 0 }} />
          </button>
                      {/* Modal de confirmation de suppression */}
                      <ConfirmationModal
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={() => { setShowDeleteModal(false); if (typeof onDelete === 'function') onDelete(task.id); }}
                        title="Confirmation de suppression"
                        message={`Êtes-vous sûr de vouloir supprimer la tâche :\n« ${titre} » ? Cette action est irréversible.`}
                        confirmText="Supprimer"
                        cancelText="Annuler"
                        type="danger"
                      />
                {/* Modal d'édition */}
                {showEditModal && (
                  <div
                    className="modal-overlay active"
                    tabIndex={-1}
                    style={{ zIndex: 1000, background: 'rgba(30,40,60,0.45)', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}
                    onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowEditModal(false); }}
                    onKeyDown={e => { if (e.key === 'Escape') setShowEditModal(false); }}
                  >
                    <div
                      className="modal-content"
                      style={{
                        maxWidth: 520,
                        margin: '5% auto',
                        background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
                        borderRadius: 18,
                        boxShadow: '0 8px 40px #0002',
                        padding: '36px 32px 28px 32px',
                        position: 'relative',
                        outline: 'none',
                        maxHeight: '92vh',
                        overflowY: 'auto',
                        overscrollBehavior: 'contain',
                        border: '1.5px solid #2563eb22',
                      }}
                    >
                      <button aria-label="Fermer" onClick={() => setShowEditModal(false)} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 28, color: '#64748b', cursor: 'pointer', fontWeight: 700, transition: 'color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                        ×
                      </button>
                      <h2 style={{ marginTop: 0, marginBottom: 8, textAlign: 'center', fontWeight: 900, color: '#1d4ed8', letterSpacing: 0.5, fontSize: 26, textShadow: '0 2px 8px #2563eb11' }}>Modifier la tâche</h2>
                      <div style={{ textAlign: 'center', color: '#64748b', fontWeight: 500, marginBottom: 18, fontSize: 15 }}>
                        Veuillez remplir tous les champs obligatoires pour mettre à jour la tâche.
                      </div>
                      <form onSubmit={e => {
                        e.preventDefault();
                        // ...existing code...
                        console.log('[TaskCard] Edit form submitted');
                        const isValid = validateEditForm();
                        console.log('[TaskCard] Form validation result:', isValid);
                        if (!isValid) {
                          console.log('[TaskCard] Form validation failed, errors:', editErrors);
                          return;
                        }
                        const overlapping = getEditOverlappingAssignees();
                        console.log('[TaskCard] Overlapping assignees:', overlapping);
                        if (overlapping.length > 0 && !editPendingSubmit) {
                          console.log('[TaskCard] Has overlaps, setting pending submit');
                          setEditPendingSubmit(true);
                          return;
                        }
                        console.log('[TaskCard] Calling onEdit with:', {
                          taskId: id,
                          editValues,
                          onEditExists: typeof onEdit === 'function'
                        });
                        setShowEditModal(false);
                        if (typeof onEdit === 'function') {
                          onEdit(id, editValues);
                        } else {
                          console.error('[TaskCard] onEdit is not a function:', onEdit);
                        }
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                          <label style={{ fontWeight: 700, color: '#1e293b', marginBottom: 2, fontSize: 15, letterSpacing: 0.1 }}>Titre de la tâche
                            <input type="text" value={editValues.titre} onChange={e => setEditValues(v => ({ ...v, titre: e.target.value }))}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #2563eb55', marginTop: 6, fontSize: '1.08em', background: '#f1f5f9', fontWeight: 600, color: '#1e293b', outline: 'none', boxShadow: '0 1px 4px #2563eb11' }}
                              placeholder="Titre de la tâche" />
                            {editErrors.titre && <div className="form-error" style={{ color: '#ef4444', fontWeight: 600, marginTop: 2 }}>{editErrors.titre}</div>}
                          </label>
                          <label style={{ fontWeight: 700, color: '#1e293b', marginBottom: 2, fontSize: 15, letterSpacing: 0.1 }}>Description
                            <textarea value={editValues.description} onChange={e => setEditValues(v => ({ ...v, description: e.target.value }))}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #2563eb55', marginTop: 6, minHeight: 70, fontSize: '1.08em', background: '#f1f5f9', fontWeight: 500, color: '#334155', outline: 'none', boxShadow: '0 1px 4px #2563eb11', resize: 'vertical' }}
                              placeholder="Description détaillée de la tâche" />
                            {editErrors.description && <div className="form-error" style={{ color: '#ef4444', fontWeight: 600, marginTop: 2 }}>{editErrors.description}</div>}
                          </label>
                          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                            <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, flex: 1, minWidth: 160 }}>Priorité
                              <select value={editValues.priorite} onChange={e => setEditValues(v => ({ ...v, priorite: e.target.value }))}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #f59e42', marginTop: 6, fontSize: '1em', background: '#fff7ed', color: '#b45309', fontWeight: 700, outline: 'none' }}>
                                <option value="URGENTE">Urgente</option>
                                <option value="HAUTE">Haute</option>
                                <option value="MOYENNE">Moyenne</option>
                                <option value="BASSE">Basse</option>
                              </select>
                            </label>
                            <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, flex: 1, minWidth: 160 }}>Date de début
                              <input type="date" value={editValues.dateDebut} onChange={e => setEditValues(v => ({ ...v, dateDebut: e.target.value }))}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #2563eb33', marginTop: 6, fontSize: '1em', background: '#f1f5f9', color: '#1e293b', fontWeight: 600, outline: 'none' }} />
                              {editErrors.dateDebut && <div className="form-error" style={{ color: '#ef4444', fontWeight: 600, marginTop: 2 }}>{editErrors.dateDebut}</div>}
                            </label>
                            <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, flex: 1, minWidth: 160 }}>Date d'échéance
                              <input type="date" value={editValues.dateEcheance} onChange={e => setEditValues(v => ({ ...v, dateEcheance: e.target.value }))}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #ef444433', marginTop: 6, fontSize: '1em', background: '#f1f5f9', color: '#1e293b', fontWeight: 600, outline: 'none' }} />
                              {editErrors.dateEcheance && <div className="form-error" style={{ color: '#ef4444', fontWeight: 600, marginTop: 2 }}>{editErrors.dateEcheance}</div>}
                            </label>
                          </div>
                          <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 2 }}>Assignés à la tâche
                            <UserSelector
                              users={Array.isArray(project?.groupes) ? project.groupes.flatMap(g => Array.isArray(g.membres) ? g.membres.map(m => ({
                                ...m,
                                type: 'membre',
                                value: { ...m, groupeId: g.id || g._id }
                              })) : []) : []}
                              selectedUsers={editValues.assignesA || []}
                              onChange={(selected) => setEditValues(v => ({ ...v, assignesA: selected }))}
                              placeholder="Sélectionner des membres..."
                            />
                            {editErrors.assignesA && <div className="form-error" style={{ color: '#ef4444', fontWeight: 600, marginTop: 2 }}>{editErrors.assignesA}</div>}
                          </label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18, marginTop: 32 }}>
                          <button type="button" className="btn btn-secondary" style={{ minWidth: 120, fontWeight: 700, fontSize: 16, borderRadius: 8, padding: '10px 0', background: '#f3f4f6', color: '#334155', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 4px #0001', transition: 'background 0.2s, color 0.2s' }}
                            onClick={() => setShowEditModal(false)}
                            onMouseOver={e => e.currentTarget.style.background = '#e0e7ef'}
                            onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}>
                            Annuler
                          </button>
                          <button type="submit" className="btn btn-primary" style={{ minWidth: 150, fontWeight: 800, fontSize: 16, borderRadius: 8, padding: '7px 0', background: 'linear-gradient(90deg, #2563eb 70%, #3b82f6 100%)', color: '#fff', border: 'none', boxShadow: '0 2px 8px #2563eb22', letterSpacing: 0.2, transition: 'background 0.2s, color 0.2s' }}>
                            Enregistrer
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
          <button className="btn-icon" title="Commentaires">
            <i className="fas fa-comment"></i>
          </button>
          <button className="btn-icon" title="Pièces jointes" onClick={() => setShowAttachmentModal(true)}>
            <i className="fas fa-paperclip"></i>
          </button>
          {showAttachmentModal && (
            <div className="modal-overlay active" style={{
              zIndex: 1200,
              background: 'rgba(30,40,60,0.45)',
              position: 'fixed',
              top: 0, left: 0, width: '100vw', height: '100vh',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }} onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowAttachmentModal(false); }}>
              <div className="modal-content" style={{
                minWidth: 340,
                maxWidth: 420,
                width: '100%',
                background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
                borderRadius: 18,
                padding: '36px 32px 28px 32px',
                position: 'relative',
                boxShadow: '0 8px 40px #0004',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <button aria-label="Fermer" onClick={() => setShowAttachmentModal(false)}
                  style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 28, color: '#64748b', cursor: 'pointer', fontWeight: 700, transition: 'color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.color = '#2563eb'}
                  onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                >×</button>
                <h3 style={{ marginTop: 0, marginBottom: 18, color: '#2563eb', fontWeight: 800, fontSize: 23, letterSpacing: 0.2, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-paperclip" style={{ fontSize: 22 }}></i> Pièces jointes
                </h3>
                <form onSubmit={handleAttachmentUpload} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                  <label htmlFor="file-upload-modal" style={{
                    display: 'flex', alignItems: 'center', gap: 10, cursor: attachmentLoading ? 'not-allowed' : 'pointer',
                    background: '#f1f5f9', borderRadius: 8, padding: '10px 18px', border: '1.5px dashed #2563eb', fontWeight: 600, color: '#2563eb', fontSize: 15, transition: 'background 0.2s, color 0.2s', marginBottom: 2
                  }}>
                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: 18 }}></i>
                    {selectedFile ? selectedFile.name : 'Sélectionner un fichier...'}
                    <input id="file-upload-modal" type="file" onChange={e => setSelectedFile(e.target.files[0])} disabled={attachmentLoading}
                      style={{ display: 'none' }} />
                  </label>
                  <button type="submit" className="btn btn-primary" disabled={attachmentLoading || !selectedFile}
                    style={{
                      minWidth: 140,
                      fontWeight: 800,
                      fontSize: 16,
                      borderRadius: 8,
                      padding: '10px 0',
                      background: 'linear-gradient(90deg, #2563eb 70%, #3b82f6 100%)',
                      color: '#fff',
                      border: 'none',
                      boxShadow: '0 2px 8px #2563eb22',
                      letterSpacing: 0.2,
                      transition: 'background 0.2s, color 0.2s',
                      marginTop: 2,
                      cursor: attachmentLoading || !selectedFile ? 'not-allowed' : 'pointer'
                    }}>
                    {attachmentLoading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-upload"></i> Envoyer</>}
                  </button>
                  {attachmentMessage && <div style={{ marginTop: 8, color: attachmentMessage.startsWith('✅') ? '#059669' : '#b91c1c', fontWeight: 700, fontSize: 15, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {attachmentMessage.startsWith('✅') ? <i className="fas fa-check-circle"></i> : <i className="fas fa-exclamation-circle"></i>}
                    {attachmentMessage}
                  </div>}
                </form>
                <div style={{ width: '100%', marginTop: 22, borderTop: '1.5px solid #e5e7eb', paddingTop: 14 }}>
                  <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 8, fontSize: 15, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <i className="fas fa-folder-open"></i> Fichiers déjà joints
                  </div>
                  {filesLoading ? (
                    <div style={{ color: '#64748b', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}><i className="fas fa-spinner fa-spin"></i> Chargement...</div>
                  ) : attachedFiles && attachedFiles.length > 0 ? (
                    <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
                      {attachedFiles.map(file => (
                        <li key={file.id || file.nom} style={{ marginBottom: 7, borderRadius: 7, transition: 'background 0.2s', padding: '4px 0' }}>
                          <a href={file.url} target="_blank" rel="noopener noreferrer"
                            style={{
                              color: '#2563eb',
                              textDecoration: 'none',
                              fontWeight: 600,
                              display: 'flex', alignItems: 'center', gap: 7,
                              padding: '4px 8px', borderRadius: 6,
                              transition: 'background 0.2s, color 0.2s',
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = '#e0e7ef'; e.currentTarget.style.color = '#1e40af'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#2563eb'; }}
                          >
                            <i className="fas fa-file-alt" style={{ fontSize: 16 }}></i>{file.nom || file.filename || 'Fichier'}
                            <i className="fas fa-external-link-alt" style={{ fontSize: 12, marginLeft: 4, opacity: 0.7 }}></i>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: 15 }}>Aucun fichier joint.</div>
                  )}
                </div>
                {!task.livrableAssocie && (
                  <div style={{ marginTop: 18, color: '#b91c1c', fontWeight: 700, fontSize: 15, textAlign: 'center' }}>
                    Aucun livrable associé à cette tâche. Impossible d'ajouter une pièce jointe.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="task-meta">
          {isLate && (
            <span className="task-late-warning" style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.98em', display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="fas fa-exclamation-triangle"></i>
              En retard
            </span>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default TaskCard;
