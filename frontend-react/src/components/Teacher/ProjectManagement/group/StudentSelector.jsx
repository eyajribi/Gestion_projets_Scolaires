import React, { useState, useMemo } from 'react';
import SearchFilter from '../../../Common/SearchFilter';
import Pagination from '../../../Common/Pagination';
import LoadingSpinner from '../../../UI/LoadingSpinner';

const StudentSelector = ({ 
  students, 
  onSelect, 
  onClose,
  maxSelection,
  title = "Ajouter des membres",
  subtitle = "Sélectionnez les étudiants à ajouter au groupe",
  showHeader = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtrer les étudiants selon la recherche
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    
    const searchLower = searchTerm.toLowerCase();
    return students.filter(student => 
      student.prenom?.toLowerCase().includes(searchLower) ||
      student.nom?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.matricule?.toLowerCase().includes(searchLower) ||
      `${student.prenom} ${student.nom}`.toLowerCase().includes(searchLower)
    );
  }, [students, searchTerm]);

  // Statistiques pour l'en-tête
  const stats = useMemo(() => {
    const activeStudents = students.filter(s => s.statut !== 'INACTIF').length;
    const availableStudents = students.length;
    
    return {
      available: availableStudents,
      active: activeStudents,
      filtered: filteredStudents.length
    };
  }, [students, filteredStudents]);

const handleSelect = async (student) => {
  if (isProcessing || student.statut === 'INACTIF') return;
  
  if (maxSelection && maxSelection <= 0) {
    return; 
  }
  
  setIsProcessing(true);
  setSelectedStudent(student);
  
  try {
    await onSelect(student);
    setTimeout(() => {
      setSelectedStudent(null);
    }, 1000);
  } catch (error) {
    console.error('Erreur sélection étudiant:', error);
    setSelectedStudent(null);
  } finally {
    setIsProcessing(false);
  }
};

  const getStudentInitials = (student) => {
    return `${student.prenom?.charAt(0) || ''}${student.nom?.charAt(0) || ''}`.toUpperCase();
  };

  const getStudentStatus = (student) => {
    if (student.statut === 'INACTIF') return 'inactif';
    if (student.groupsCount && student.groupsCount >= 3) return 'surcharge';
    if (student.groupsCount && student.groupsCount >= 1) return 'occupe';
    return 'disponible';
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'inactif':
        return { 
          color: 'var(--danger-dark)', 
          label: 'Inactif', 
          icon: 'fas fa-user-slash',
          description: 'Non disponible pour les nouveaux groupes'
        };
      case 'surcharge':
        return { 
          color: 'var(--warning-dark)', 
          label: 'Surchargé', 
          icon: 'fas fa-exclamation-triangle',
          description: 'Déjà dans 3 groupes ou plus'
        };
      case 'occupe':
        return { 
          color: 'var(--info-dark)', 
          label: 'Actif', 
          icon: 'fas fa-user-check',
          description: 'Déjà dans un ou plusieurs groupes'
        };
      default:
        return { 
          color: 'var(--success-dark)', 
          label: 'Disponible', 
          icon: 'fas fa-user-plus',
          description: 'Disponible pour rejoindre le groupe'
        };
    }
  };

  const getStatusBadge = (student) => {
    const status = getStudentStatus(student);
    const statusInfo = getStatusInfo(status);
    
    return (
      <div 
        className={`status-badge ${status}`}
        title={statusInfo.description}
      >
        <i className={statusInfo.icon}></i>
        {statusInfo.label}
      </div>
    );
  };

  const totalStudents = filteredStudents.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

  return (
    <div className="student-selector-modal-overlay">
      <div className="student-selector-modal">
        {/* En-tête */}
      {showHeader && (
        <div className="selector-header">
          <div className="header-content">
            <div className="header-title">
              <h3>{title}</h3>
              <p className="header-subtitle">{subtitle}</p>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-value">{stats.filtered}</span>
                <span className="stat-label">étudiant{stats.filtered > 1 ? 's' : ''}</span>
              </div>
              {maxSelection !== undefined && (
                <div className="stat-item highlight">
                  <span className="stat-value">{maxSelection}</span>
                  <span className="stat-label">place{maxSelection > 1 ? 's' : ''} restante{maxSelection > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Recherche */}
      <div className="search-section">
        <SearchFilter
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Rechercher un étudiant par nom, prénom, email..."
          autoFocus
        />
        {searchTerm && (
          <button 
            className="btn btn-icon btn-clear"
            onClick={() => setSearchTerm('')}
            aria-label="Effacer la recherche"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

        {/* Liste des étudiants */}
      <div className="students-container">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <h4>
              {students.length === 0 
                ? "Aucun étudiant disponible" 
                : "Aucun étudiant trouvé"
              }
            </h4>
            <p>
              {students.length === 0 
                ? "Tous les étudiants sont déjà assignés à des groupes."
                : `Aucun étudiant ne correspond à "${searchTerm}".`
              }
            </p>
            {searchTerm && (
              <button 
                className="btn btn-outline"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-undo"></i>
                Afficher tous les étudiants
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="students-list">
              {paginatedStudents.map(student => {
              const status = getStudentStatus(student);
              const statusInfo = getStatusInfo(status);
              const isSelected = selectedStudent?.id === student.id;
              const isDisabled =
                student.statut === 'INACTIF' ||
                status === 'surcharge' ||
                isProcessing ||
                (maxSelection !== undefined && maxSelection <= 0);
              
              return (
                <div
                  key={student.id}
                  className={`student-item ${status} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && handleSelect(student)}
                >
                  <div className="student-avatar">
                    <div className="avatar-placeholder">
                      {getStudentInitials(student)}
                    </div>
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: statusInfo.color }}
                      title={statusInfo.label}
                    ></div>
                  </div>

                  <div className="student-info">
                    <div className="student-main">
                      <div className="student-name">
                        {student.prenom} <strong>{student.nom}</strong>
                      </div>
                      <div className="student-email">
                        <i className="fas fa-envelope"></i>
                        {student.email}
                      </div>
                    </div>
                    
                    <div className="student-meta">
                      {student.matricule && (
                        <div className="student-id">
                          <i className="fas fa-id-card"></i>
                          {student.matricule}
                        </div>
                      )}
                      {student.groupsCount !== undefined && (
                        <div className="student-groups">
                          <i className="fas fa-users"></i>
                          {student.groupsCount} groupe{student.groupsCount > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="student-actions">
                    {getStatusBadge(student)}
                    
                    {!isDisabled ? (
                      <button
                        className={`btn btn-select ${isSelected ? 'selecting' : ''}`}
                        disabled={isProcessing}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(student);
                        }}
                      >
                        {isSelected ? (
                          <div className="selection-feedback">
                            <i className="fas fa-check"></i>
                            Ajouté
                          </div>
                        ) : (
                          <>
                            <i className="fas fa-plus"></i>
                            Ajouter
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="disabled-state">
                        <i className="fas fa-ban"></i>
                        Indisponible
                      </div>
                    )}

                    {isProcessing && isSelected && (
                      <div className="selection-loading">
                        <LoadingSpinner size="small" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>

            <Pagination
              totalItems={totalStudents}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>

        {/* Légende des statuts */}
      <div className="status-legend">
        <div className="legend-title">Légende des statuts:</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color disponible"></div>
            <span>Disponible</span>
          </div>
          <div className="legend-item">
            <div className="legend-color occupe"></div>
            <span>Déjà en groupe</span>
          </div>
          <div className="legend-item">
            <div className="legend-color surcharge"></div>
            <span>Surchargé</span>
          </div>
          <div className="legend-item">
            <div className="legend-color inactif"></div>
            <span>Inactif</span>
          </div>
        </div>
      </div>
        <button className="btn btn-close-modal" onClick={onClose} title="Fermer">
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

// Styles modaux pour overlay et centrage
// Ajoutés ici pour garantir l'affichage modal
<style jsx>{`
  .student-selector-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.45);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .student-selector-modal {
    background: var(--modal-bg, #fff);
    border-radius: 14px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.18);
    padding: 2.2rem 2.1rem 1.5rem 2.1rem;
    min-width: 340px;
    max-width: 480px;
    width: 100%;
    position: relative;
  }
  .btn-close-modal {
    position: absolute;
    top: 18px;
    right: 18px;
    background: none;
    border: none;
    font-size: 1.3rem;
    color: var(--danger-dark);
    cursor: pointer;
    z-index: 2;
  }
`}</style>
export default StudentSelector;