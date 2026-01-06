import React, { useState } from "react";
import UserSelector from '../../../Common/UserSelector';
import './KanbanTasksView.css';

const KanbanTasksView = ({ tasks = [], projectId, project, onBack, onAssign }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  // Placeholder Kanban columns
  const columns = [
    { key: "A_FAIRE", label: "À faire" },
    { key: "EN_COURS", label: "En cours" },
    { key: "TERMINEE", label: "Terminée" },
    { key: "EN_RETARD", label: "En retard" },
  ];

  return (
    <div className="kanban-view">
      <div className="kanban-header">
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <button className="btn kanban-back-btn" onClick={onBack} title="Retour à la liste" style={{marginRight: 18, boxShadow: '0 2px 8px #0001', border: 'none', background: '#f3f4f6', color: '#4f46e5', fontWeight: 700, fontSize: 18, padding: 0, width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'}}>
            <i className="fas fa-arrow-left" style={{fontSize: 20}} />
          </button>
          <h2 className="kanban-project-title" style={{margin: 0, fontWeight: 800, fontSize: 28, color: '#3b3663', letterSpacing: 0.5, textShadow: '0 2px 8px #0001'}}>
            Vue Kanban <span style={{fontWeight: 400, color: '#6b7280', fontSize: 20}}>- {project?.nom || "Projet"}</span>
          </h2>
        </div>
      </div>
      <div className="kanban-columns kanban-board">
        {columns.map((col) => (
          <div key={col.key} className="kanban-column" style={{ borderTopColor: getColumnColor(col.key) }}>
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <i className={getColumnIcon(col.key) + ' kanban-column-icon'}></i>
                <h3>{col.label}</h3>
                <span className="kanban-column-count">{tasks.filter((t) => t.statut === col.key).length}</span>
              </div>
            </div>
            <div className="kanban-column-content">
              {tasks.filter((t) => t.statut === col.key).length === 0 && (
                <div className="kanban-empty">
                  <i className="fas fa-inbox"></i>
                  <p>Aucune tâche</p>
                </div>
              )}
              {tasks.filter((t) => t.statut === col.key).map((task) => {
                const isUnassigned = !task.assignesA || task.assignesA.length === 0;
                // Prepare assignee options (groups + members)
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
                // --- Progression logic (copied from TaskCard) ---
                function safePercent(val, fallback = 0) {
                  if (val === undefined || val === null) return fallback;
                  const n = Number(val);
                  if (typeof n !== 'number' || isNaN(n) || !isFinite(n)) return fallback;
                  return Math.max(0, Math.min(100, n));
                }
                let progress = 0;
                if (task.statut === "TERMINEE") {
                  progress = 100;
                } else if (task.statut === "EN_COURS") {
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
                // --- End progression logic ---
                return (
                  <div key={task.id} className="kanban-task">
                    <div className="kanban-task-header">
                      <div className="kanban-task-title">{task.titre}</div>
                      <span className={"kanban-task-priority priority-" + (task.priorite || '').toLowerCase()}>{task.priorite}</span>
                    </div>
                    <div className="kanban-task-desc">{task.description}</div>
                    {/* Progression visuelle et pourcentage */}
                    <div className="kanban-task-progress" style={{ margin: '10px 0 6px 0' }}>
                      <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: progress === 100 ? '#10b981' : progress >= 50 ? '#3b82f6' : '#f59e0b',
                          borderRadius: 4,
                          transition: 'width 0.3s ease-in-out'
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, fontSize: '0.85em', color: '#6b7280' }}>
                        <span>0%</span>
                        <span>{progress}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <div className="kanban-task-footer">
                      <div className="kanban-task-meta">
                        <span className="kanban-task-date">
                          <i className="fas fa-calendar-alt"></i> {task.dateEcheance ? new Date(task.dateEcheance).toLocaleDateString() : "-"}
                        </span>
                        {task.assignesA && task.assignesA.length > 0 ? (
                          <span className="kanban-task-assignee">
                            <i className="fas fa-user"></i> {task.assignesA.filter(a => a && a.nom).map(a => a.nom + (a.prenom ? ' ' + a.prenom : '')).join(', ')}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 8 }}>
                            Aucun groupe/membre
                            <button
                              className="btn btn-sm btn-primary"
                              style={{ marginLeft: 8, padding: '2px 8px', fontSize: 16, borderRadius: 16, display: 'flex', alignItems: 'center' }}
                              title="Assigner un groupe ou membre"
                              onClick={e => { e.stopPropagation(); setSelectedTaskId(task.id); setShowAssignModal(true); setSelectedAssignees([]); }}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Modal d'assignation pour cette tâche */}
                    {showAssignModal && selectedTaskId === task.id && (
                      <div className="modal-overlay active" style={{ zIndex: 1000 }} onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowAssignModal(false); }}>
                        <div className="modal-content" style={{ maxWidth: 420, margin: '8% auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 32px #0002', padding: 24, position: 'relative' }}>
                          <h3 style={{ marginTop: 0 }}>Assigner la tâche</h3>
                          <UserSelector
                            users={assigneeOptions}
                            selectedUsers={selectedAssignees}
                            onChange={setSelectedAssignees}
                            placeholder="Sélectionnez un groupe ou membre..."
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
                            <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Annuler</button>
                            <button
                              className="btn btn-primary"
                              disabled={selectedAssignees.length === 0}
                              onClick={() => {
                                setShowAssignModal(false);
                                if (typeof onAssign === 'function') onAssign(task.id, selectedAssignees);
                              }}
                            >
                              Assigner
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanTasksView;

// Helpers for icons and colors
function getColumnColor(key) {
  switch (key) {
    case "A_FAIRE": return "#f59e42";
    case "EN_COURS": return "#3b82f6";
    case "TERMINEE": return "#10b981";
    case "EN_RETARD": return "#ef4444";
    default: return "#d1d5db";
  }
}
function getColumnIcon(key) {
  switch (key) {
    case "A_FAIRE": return "fas fa-lightbulb";
    case "EN_COURS": return "fas fa-spinner";
    case "TERMINEE": return "fas fa-check-circle";
    case "EN_RETARD": return "fas fa-exclamation-triangle";
    default: return "fas fa-tasks";
  }
}