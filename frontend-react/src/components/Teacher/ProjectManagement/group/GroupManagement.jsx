import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GroupCard from "./GroupCard";
import GroupEditModal from "./GroupEditModal"; // Nouveau modal
import GroupWizard from "./GroupWizard";
import ConfirmationModal from "../../../Common/ConfirmationModal";
import SearchFilter from "../../../Common/SearchFilter";
import Pagination from "../../../Common/Pagination";
import LoadingSpinner from "../../../UI/LoadingSpinner";
import Toast from "../../../UI/Toast";
import { groupService } from "../../../../services/groupService";
import GroupDetailsModal from "./GroupDetailsModal";
import { userService } from "../../../../services/userService";

const GroupManagement = ({ onBack, fromProjectId: propFromProjectId }) => {
    // Scope d'affichage : groupes actifs ou archivés
    const [groupScope, setGroupScope] = useState('active'); // 'active' ou 'archived'
  const location = useLocation();
  const fromProjectId = propFromProjectId || location.state?.fromProjectId || null;

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const [activeModal, setActiveModal] = useState(null);
    const [restoreModal, setRestoreModal] = useState({ isOpen: false, group: null });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Méthode pour récupérer les étudiants d'un groupe
  const getGroupStudents = async (groupId) => {
    try {
      const students = await groupService.getGroupStudents(groupId);
      return Array.isArray(students) ? students : [];
    } catch (error) {
      console.error(
        `❌ Erreur récupération étudiants groupe ${groupId}:`,
        error
      );
      return [];
    }
  };

  // Méthode pour récupérer les projets d'un groupe
  const getGroupProjects = async (groupId) => {
    try {
      const projects = await groupService.getGroupProjects(groupId);
      return Array.isArray(projects) ? projects : [];
    } catch (error) {
      console.error(`❌ Erreur récupération projets groupe ${groupId}:`, error);
      return [];
    }
  };

  // Méthode pour enrichir un groupe avec ses étudiants et projets
  const enrichGroupData = async (group) => {
    try {
      const [groupStudents, groupProjects] = await Promise.all([
        getGroupStudents(group.id),
        getGroupProjects(group.id),
      ]);

      return {
        id: group.id || group._id,
        nom: group.nom || "Groupe sans nom",
        description: group.description || "",
        pourcentageAvancement: group.pourcentageAvancement || 0,
        dateCreation: group.dateCreation || new Date().toISOString(),
        dateModification: group.dateModification || null,
        etudiants: groupStudents,
        projets: groupProjects,
        statut: group.statut || "ACTIF",
        archive: group.archive || false, // Ajout du champ archive
      };
    } catch (error) {
      console.error(`❌ Erreur enrichissement groupe ${group.id}:`, error);
      return {
        ...group,
        etudiants: [],
        projets: [],
        archive: group.archive || false,
      };
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [groupsData, allStudentsData] = await Promise.all([
        groupService.getGroups(),
        userService.getStudents(),
      ]);

      const enrichedGroups = await Promise.all(
        groupsData.map((group) => enrichGroupData(group))
      );

      setGroups(enrichedGroups);
      setStudents(Array.isArray(allStudentsData) ? allStudentsData : []);

      console.log("✅ Données chargées:", {
        groups: enrichedGroups.length,
        students: allStudentsData.length,
      });

      // Si on vient d'un projet et qu'un seul groupe lui est lié, ouvrir directement ses détails
      if (fromProjectId) {
        const groupsForProject = enrichedGroups.filter((g) =>
          g.projets?.some((p) => p.id === fromProjectId)
        );
        if (groupsForProject.length === 1) {
          openModal("details", groupsForProject[0]);
        }
      }
    } catch (error) {
      console.error("❌ Erreur chargement données:", error);
      showToast("Erreur lors du chargement des données", "error");
      setGroups([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (modalName, group = null) => {
    setActiveModal(modalName);
    setSelectedGroup(group);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedGroup(null);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      console.log("🆕 Données création groupe:", groupData);

      const payload = {
        nom: groupData.nom?.trim() || "",
        description: groupData.description?.trim() || "",
      };

      // 1. Créer le groupe d'abord
      const newGroup = await groupService.createGroup(payload);
      const enrichedGroup = await enrichGroupData(newGroup);

      // 2. Ajouter les étudiants sélectionnés un par un
      if (groupData.etudiants && groupData.etudiants.length > 0) {
        console.log(
          `➕ Ajout de ${groupData.etudiants.length} étudiants au nouveau groupe`
        );

        for (const studentId of groupData.etudiants) {
          try {
            await groupService.addStudentToGroup(newGroup.id, studentId);
            console.log(
              `✅ Étudiant ${studentId} ajouté au groupe ${newGroup.id}`
            );
          } catch (error) {
            console.error(`❌ Erreur ajout étudiant ${studentId}:`, error);
            // Continuer avec les autres étudiants même si un échoue
          }
        }
      }   

      // 3. Recharger les données complètes du groupe
      const updatedGroup = await groupService.getGroupById(newGroup.id);
      const finalEnrichedGroup = await enrichGroupData(updatedGroup);

      // 3bis. Si le groupe est créé depuis un projet, lier groupe <-> projet côté backend
      if (groupData.projectId) {
        try {
          await groupService.addProjectToGroup(finalEnrichedGroup.id, groupData.projectId);
          console.log(
            `✅ Groupe ${finalEnrichedGroup.id} lié au projet ${groupData.projectId}`
          );
        } catch (error) {
          console.error("❌ Erreur liaison groupe->projet:", error);
        }
      }

      setGroups((prev) => [...prev, finalEnrichedGroup]);
      closeModal();
      showToast(
        "Groupe créé avec succès" +
          (groupData.etudiants?.length > 0
            ? ` avec ${groupData.etudiants.length} étudiant(s)`
            : "")
      );
      return true;
    } catch (error) {
      console.error("❌ Erreur création groupe:", error);
      showToast("Erreur lors de la création du groupe", "error");
      return false;
    }
  };

  const handleUpdateGroup = async (groupId, groupData) => {
    try {
      const updatedGroup = await groupService.updateGroup(groupId, groupData);
      const enrichedGroup = await enrichGroupData(updatedGroup);

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? enrichedGroup : g))
      );
      showToast("Groupe modifié avec succès");
      return true;
    } catch (error) {
      console.error("❌ Erreur mise à jour groupe:", error);
      showToast("Erreur lors de la modification du groupe", "error");
      return false;
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await groupService.deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      showToast("Groupe archivé avec succès");
      return true;
    } catch (error) {
      console.error("❌ Erreur suppression groupe:", error);
      showToast("Erreur lors de la suppression du groupe", "error");
      return false;
    }
  };

  const handleAddStudent = async (groupId, student) => {
    try {
      console.log("➕ Ajout étudiant / liaison:", { groupId, student });

      // Cas spécial: liaison groupe <-> projet sans ajout d'étudiant
      if (student && student.__linkOnly && student.projectId) {
        try {
          await groupService.addProjectToGroup(groupId, student.projectId);
          showToast("Groupe lié au projet avec succès");
          return true;
        } catch (error) {
          console.error("❌ Erreur liaison groupe-projet:", error);
          showToast("Erreur lors de la liaison du groupe au projet", "error");
          return false;
        }
      }

      const result = await groupService.addStudentToGroup(
        groupId,
        student.id
      );

      // Recharger les données du groupe après ajout
      const updatedGroup = await groupService.getGroupById(groupId);
      const enrichedGroup = await enrichGroupData(updatedGroup);

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? enrichedGroup : g))
      );

      showToast("Étudiant ajouté au groupe");
      return true;
    } catch (error) {
      console.error("❌ Erreur ajout étudiant:", error);

      let errorMessage = "Erreur lors de l'ajout de l'étudiant";
      if (error.message.includes("déjà présent")) {
        errorMessage = "Cet étudiant est déjà dans le groupe";
      } else if (error.message.includes("non trouvé")) {
        errorMessage = "Groupe ou étudiant non trouvé";
      }

      showToast(errorMessage, "error");
      return false;
    }
  };

  // Filtrage / tri / pagination des groupes
  // Séparation des groupes actifs et archivés
  const activeGroups = groups.filter(g => !g.archive);
  const archivedGroups = groups.filter(g => g.archive);

  // Liste courante selon le scope
  const currentGroups = groupScope === 'active' ? activeGroups : archivedGroups;

  const filteredGroups = currentGroups.filter((group) => {
    const matchesSearch = group.nom
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "hasStudents" && group.etudiants?.length > 0) ||
      (filter === "noStudents" && (!group.etudiants || group.etudiants.length === 0));
    return matchesSearch && matchesFilter;
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.nom.localeCompare(b.nom);
      case "students":
        return (b.etudiants?.length || 0) - (a.etudiants?.length || 0);
      case "projects":
        return (b.projets?.length || 0) - (a.projets?.length || 0);
      default:
        return 0;
    }
  });

  const totalGroups = sortedGroups.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedGroups = sortedGroups.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleRemoveStudent = async (groupId, studentId) => {
    try {
      await groupService.removeStudentFromGroup(groupId, studentId);

      const updatedGroup = await groupService.getGroupById(groupId);
      const enrichedGroup = await enrichGroupData(updatedGroup);

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? enrichedGroup : g))
      );
      showToast("Étudiant retiré du groupe");
      return true;
    } catch (error) {
      console.error("❌ Erreur retrait étudiant:", error);
      showToast("Erreur lors du retrait de l'étudiant", "error");
      return false;
    }
  };

  // Calculer l'avancement d'un groupe
  const handleCalculateProgress = async (groupId) => {
    try {
      await groupService.calculateGroupProgress(groupId);

      const updatedGroup = await groupService.getGroupById(groupId);
      const enrichedGroup = await enrichGroupData(updatedGroup);

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? enrichedGroup : g))
      );
      showToast("Avancement calculé avec succès");
    } catch (error) {
      console.error("❌ Erreur calcul avancement:", error);
      showToast("Erreur lors du calcul de l'avancement", "error");
    }
  };

  // Filtrage et tri
  const filteredAndSortedGroups = groups
    .filter((group) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      const groupName = group.nom?.toLowerCase() || "";
      const groupDescription = group.description?.toLowerCase() || "";

      const hasMatchingStudent =
        group.etudiants?.some((etudiant) => {
          const studentName = `${etudiant.prenom || ""} ${
            etudiant.nom || ""
          }`.toLowerCase();
          return studentName.includes(searchLower);
        }) || false;

      return (
        groupName.includes(searchLower) ||
        groupDescription.includes(searchLower) ||
        hasMatchingStudent
      );
    })
    .filter((group) => {
      switch (filter) {
        case "withStudents":
          return (group.etudiants?.length || 0) > 0;
        case "withoutStudents":
          return (group.etudiants?.length || 0) === 0;
        case "active":
          return group.statut === "ACTIF";
        case "inactive":
          return group.statut === "INACTIF";
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.nom || "").localeCompare(b.nom || "");
        case "students":
          return (b.etudiants?.length || 0) - (a.etudiants?.length || 0);
        case "progress":
          return (
            (b.pourcentageAvancement || 0) - (a.pourcentageAvancement || 0)
          );
        case "recent":
          return new Date(b.dateCreation || 0) - new Date(a.dateCreation || 0);
        default:
          return 0;
      }
    });

  // Statistiques
  const stats = {
    totalGroups: groups.length,
    totalStudents: students.length,
    assignedStudents: groups.reduce(
      (acc, group) => acc + (group.etudiants?.length || 0),
      0
    ),
    activeGroups: groups.filter((g) => g.statut === "ACTIF").length,
    groupsForProject: fromProjectId
      ? groups.filter((g) =>
          g.projets?.some((p) => p.id === fromProjectId)
        ).length
      : 0,
  };

  if (loading) {
    return (
      <div className="group-management-loading">
        <LoadingSpinner />
        <p>Chargement des groupes...</p>
      </div>
    );
  }

  return (
    <div className="management-container group-modern">
      {/* Switch scope groupes actifs/archivés */}
      <div className="scope-switch">
        <div className="scope-btn-group">
          <button
            className={`scope-btn${groupScope === 'active' ? ' selected' : ''}`}
            onClick={() => setGroupScope('active')}
          >
            <i className="fas fa-users"></i> Groupes actifs
          </button>
          <button
            className={`scope-btn${groupScope === 'archived' ? ' selected' : ''}`}
            onClick={() => setGroupScope('archived')}
          >
            <i className="fas fa-box-archive"></i> Groupes archivés
          </button>
        </div>
      <style jsx>{`
        .scope-switch {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.2rem;
        }
        .scope-btn-group {
          display: flex;
          gap: 0.5rem;
        }
        .scope-btn {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 0.5rem 1.2rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .scope-btn.selected {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .scope-btn:hover {
          background: var(--primary-light);
          color: var(--primary);
          border-color: var(--primary-light);
        }
      `}</style>
      </div>
      {/* En-tête sticky avec actions */}
      <div className="page-header sticky-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Gestion des Groupes</h1>
            <p>Organisez les étudiants en équipes de travail collaboratif</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Vue grille"
              aria-label="Vue grille"
            >
              <i className="fas fa-th"></i>
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="Vue liste"
              aria-label="Vue liste"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => openModal("wizard")}
          >
            <i className="fas fa-plus"></i>
            Nouveau Groupe
          </button>
        </div>
      </div>

      {/* Statistiques (style similaire aux tâches) */}
      <div className="group-stats task-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalGroups}</div>
          <div className="stat-label">Groupes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Étudiants</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.assignedStudents}</div>
          <div className="stat-label">Étudiants assignés</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeGroups}</div>
          <div className="stat-label">Groupes actifs</div>
        </div>
        {fromProjectId && (
          <div className="stat-card">
            <div className="stat-value">{stats.groupsForProject}</div>
            <div className="stat-label">Liés à ce projet</div>
          </div>
        )}
      </div>

      {/* Filtres sticky */}
      <div className="filters-section sticky-filters">
        <div className="filters-left">
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher un groupe, un étudiant..."
          />
        </div>
        <div className="filters-right">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les groupes</option>
            <option value="withStudents">Avec étudiants</option>
            <option value="withoutStudents">Sans étudiants</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name">Nom A-Z</option>
            <option value="students">Nombre d'étudiants</option>
            <option value="progress">Progression</option>
            <option value="recent">Récents</option>
          </select>
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Vue grille"
              aria-label="Vue grille"
            >
              <i className="fas fa-th"></i>
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="Vue liste"
              aria-label="Vue liste"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des groupes */}
      <div className="groups-container modern-grid">
        {filteredGroups.length > 0 ? (
          <>
            <div className={`items-grid modern-grid${viewMode === "list" ? " list" : ""}`}>
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  allStudents={students}
                  viewMode={viewMode}
                  fromProjectId={fromProjectId}
                  onEdit={() => openModal("edit", group)}
                  onDelete={() => openModal("delete", group)}
                  onAddStudent={handleAddStudent}
                  onRemoveStudent={handleRemoveStudent}
                  onCalculateProgress={() => handleCalculateProgress(group.id)}
                  onViewDetails={() => openModal("details", group)}
                  onRestore={groupScope === 'archived' ? () => setRestoreModal({ isOpen: true, group }) : undefined}
                  groupScope={groupScope}
                />
              ))}
            </div>
            <Pagination
              totalItems={filteredGroups.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        ) : (
          <div className="empty-state modern-empty">
            <div className="empty-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>
              {currentGroups.length === 0
                ? (groupScope === 'active' ? "Commencez par créer votre premier groupe" : "Aucun groupe archivé")
                : "Aucun groupe ne correspond à votre recherche"}
            </h3>
            <p>
              {currentGroups.length === 0
                ? "Organisez vos étudiants en groupes pour mieux gérer vos projets"
                : "Essayez de modifier vos critères de recherche ou de filtrage"}
            </p>
            {groupScope === 'active' && currentGroups.length === 0 && (
              <button
                className="btn btn-primary"
                onClick={() => openModal("wizard")}
              >
                <i className="fas fa-plus"></i>
                Créer votre premier groupe
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
            {/* Modal de confirmation restauration */}
            {restoreModal.isOpen && restoreModal.group && (
              <ConfirmationModal
                isOpen={true}
                onClose={() => setRestoreModal({ isOpen: false, group: null })}
                onConfirm={async () => {
                  await groupService.deleteGroup(restoreModal.group.id);
                  setRestoreModal({ isOpen: false, group: null });
                  showToast("Groupe restauré avec succès");
                  loadData();
                }}
                title="Restaurer le groupe"
                message={
                  <>
                    <p>
                      Êtes-vous sûr de vouloir restaurer le groupe <strong>"{restoreModal.group.nom}"</strong> ?
                    </p>
                    <p className="warning-text">
                      <i className="fas fa-info-circle"></i>
                      Le groupe sera remis dans la liste des groupes actifs.
                    </p>
                  </>
                }
                confirmText="Restaurer le groupe"
                cancelText="Annuler"
                type="primary"
              />
            )}
      {activeModal === "wizard" && (
        <GroupWizard
          onClose={closeModal}
          onSubmit={handleCreateGroup}
          students={students}
          fromProjectId={fromProjectId}
        />
      )}

      {activeModal === "edit" && selectedGroup && (
        <GroupEditModal
          group={selectedGroup}
          isOpen={true}
          onClose={closeModal}
          onEdit={handleUpdateGroup}
          onDelete={handleDeleteGroup}
          onAddStudent={handleAddStudent}
          onRemoveStudent={handleRemoveStudent}
          onCalculateProgress={handleCalculateProgress}
          allStudents={students}
        />
      )}

      {activeModal === "delete" && selectedGroup && (
        <ConfirmationModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={() => handleDeleteGroup(selectedGroup.id)}
          title="Archiver le groupe"
          message={
            <>
              <p>
                Êtes-vous sûr de vouloir archiver le groupe{" "}
                <strong>"{selectedGroup.nom}"</strong> ?
              </p>
              <p className="warning-text">
                <i className="fas fa-exclamation-triangle"></i>
                {(selectedGroup.etudiants?.length || 0) > 0 &&
                  `Les ${selectedGroup.etudiants.length} étudiant(s) seront retirés du groupe.`}
              </p>
            </>
          }
          confirmText="Archiver le groupe"
          cancelText="Annuler"
          type="danger"
        />
      )}
      {activeModal === "details" && selectedGroup && (
        <GroupDetailsModal
          group={selectedGroup}
          isOpen={true}
          onClose={closeModal}
          onEdit={() => {
            closeModal();
            openModal("edit", selectedGroup);
          }}
          onAddStudent={handleAddStudent}
          onRemoveStudent={handleRemoveStudent}
          onCalculateProgress={handleCalculateProgress}
          allStudents={students}
        />
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
};

export default GroupManagement;
