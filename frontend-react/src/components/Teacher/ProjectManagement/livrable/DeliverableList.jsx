import React, { useState, useEffect } from 'react';
import DeliverableCard from './DeliverableCard';
import SearchFilter from '../../../Common/SearchFilter';
import Pagination from '../../../Common/Pagination';
import LoadingSpinner from '../../../UI/LoadingSpinner';
import { deliverableService } from '../../../../services/deliverableService';

const DeliverableList = ({ project }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [loading, setLoading] = useState(false);
  const [deliverables, setDeliverables] = useState(project?.livrables || []);
  const [evalLivrable, setEvalLivrable] = useState(null);
  const [evalNote, setEvalNote] = useState('');
  const [evalCommentaires, setEvalCommentaires] = useState('');

  useEffect(() => {
    setDeliverables(project?.livrables || []);
  }, [project]);

  if (!project || !project.livrables) {
    return (
      <div className="deliverable-list-loading">
        <LoadingSpinner />
        <p>Chargement des livrables...</p>
      </div>
    );
  }

  const filteredDeliverables = deliverables.filter(livrable => {
    const matchesSearch = livrable.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         livrable.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || livrable.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedDeliverables = [...filteredDeliverables].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.dateEcheance) - new Date(b.dateEcheance);
      case 'submission':
        return new Date(b.dateSoumission || 0) - new Date(a.dateSoumission || 0);
      case 'name':
        return a.nom.localeCompare(b.nom);
      case 'status':
        const statusOrder = { EN_RETARD: 0, A_SOUMETTRE: 1, SOUMIS: 2, EN_CORRECTION: 3, CORRIGE: 4, REJETE: 5 };
        return statusOrder[a.statut] - statusOrder[b.statut];
      default:
        return 0;
    }
  });

  const getDeliverableStats = () => {
    const total = deliverables.length;
    const submitted = deliverables.filter(d => d.statut === 'SOUMIS').length;
    const inCorrection = deliverables.filter(d => d.statut === 'EN_CORRECTION').length;
    const corrected = deliverables.filter(d => d.statut === 'CORRIGE').length;
    const delayed = deliverables.filter(d => {
      const now = new Date();
      const deadline = new Date(d.dateEcheance);
      return deadline < now && (d.statut === 'A_SOUMETTRE' || d.statut === 'SOUMIS');
    }).length;

    return { total, submitted, inCorrection, corrected, delayed };
  };

  const stats = getDeliverableStats();

  const handleEvaluate = async (livrableId, note, commentaires) => {
    try {
      setLoading(true);
      await deliverableService.evaluateDeliverable(livrableId, note, commentaires);

      setDeliverables(prev => prev.map(d =>
        d.id === livrableId
          ? { ...d, note, appreciation: commentaires, statut: 'CORRIGE' }
          : d
      ));
    } catch (error) {
      console.error('Erreur évaluation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const openEvalModal = (livrable) => {
    setEvalLivrable(livrable);
    setEvalNote(livrable.note != null ? String(livrable.note) : '');
    setEvalCommentaires(livrable.appreciation || '');
  };

  const closeEvalModal = () => {
    setEvalLivrable(null);
    setEvalNote('');
    setEvalCommentaires('');
  };

  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    if (!evalLivrable || evalNote === '') return;

    await handleEvaluate(evalLivrable.id, parseFloat(evalNote), evalCommentaires);
    closeEvalModal();
  };

  const handleSetInCorrection = async (livrableId) => {
    try {
      setLoading(true);
      await deliverableService.setDeliverableInCorrection(livrableId);

      setDeliverables(prev => prev.map(d =>
        d.id === livrableId
          ? { ...d, statut: 'EN_CORRECTION' }
          : d
      ));
    } catch (error) {
      console.error('Erreur mise en correction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (livrableId) => {
    try {
      setLoading(true);
      await deliverableService.rejectDeliverable(livrableId);

      setDeliverables(prev => prev.map(d =>
        d.id === livrableId
          ? { ...d, statut: 'REJETE' }
          : d
      ));
    } catch (error) {
      console.error('Erreur rejet:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'CORRIGE': return 'var(--success)';
      case 'EN_CORRECTION': return 'var(--info)';
      case 'SOUMIS': return 'var(--warning)';
      case 'A_SOUMETTRE': return 'var(--text-muted)';
      case 'EN_RETARD': return 'var(--danger)';
      case 'REJETE': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'CORRIGE': return 'Corrigé';
      case 'EN_CORRECTION': return 'En correction';
      case 'SOUMIS': return 'Soumis';
      case 'A_SOUMETTRE': return 'À soumettre';
      case 'EN_RETARD': return 'En retard';
      case 'REJETE': return 'Rejeté';
      default: return statut;
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalDeliverables = sortedDeliverables.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDeliverables = sortedDeliverables.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="deliverable-list">
      {/* En-tête */}
      <div className="list-header">
        <div className="header-content">
          <h2>Livrables du projet</h2>
          <p>Gestion des travaux à remettre par les étudiants</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="deliverable-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.submitted}</div>
          <div className="stat-label">Soumis</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.inCorrection}</div>
          <div className="stat-label">En correction</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.corrected}</div>
          <div className="stat-label">Corrigés</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-value">{stats.delayed}</div>
          <div className="stat-label">En retard</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="filters-section">
        <div className="filters-left">
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher un livrable..."
          />
        </div>

        <div className="filters-right">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="A_SOUMETTRE">À soumettre</option>
            <option value="SOUMIS">Soumis</option>
            <option value="EN_CORRECTION">En correction</option>
            <option value="CORRIGE">Corrigé</option>
            <option value="REJETE">Rejeté</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="deadline">Échéance</option>
            <option value="submission">Date soumission</option>
            <option value="name">Nom</option>
            <option value="status">Statut</option>
          </select>
        </div>
      </div>

      {/* Vue tableau (alternative) */}
      <div className="deliverable-table-view">
        <div className="table-header">
          <div className="table-row header-row">
            <div className="table-cell">Nom du livrable</div>
            <div className="table-cell">Date échéance</div>
            <div className="table-cell">Date soumission</div>
            <div className="table-cell">Statut</div>
            <div className="table-cell">Note</div>
            <div className="table-cell">Actions</div>
          </div>
        </div>
        
        <div className="table-body">
          {paginatedDeliverables.map(livrable => (
            <div key={livrable.id} className="table-row">
              <div className="table-cell">
                <div className="deliverable-name">
                  <strong>{livrable.nom}</strong>
                  {livrable.description && (
                    <span className="deliverable-description">{livrable.description}</span>
                  )}
                </div>
              </div>
              
              <div className="table-cell">
                <div className="date-info">
                  {new Date(livrable.dateEcheance).toLocaleDateString('fr-FR')}
                  {new Date(livrable.dateEcheance) < new Date() && livrable.statut !== 'CORRIGE' && (
                    <span className="late-indicator">En retard</span>
                  )}
                </div>
              </div>
              
              <div className="table-cell">
                {livrable.dateSoumission 
                  ? new Date(livrable.dateSoumission).toLocaleDateString('fr-FR')
                  : '-'
                }
              </div>
              
              <div className="table-cell">
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: `${getStatusColor(livrable.statut)}15`,
                    color: getStatusColor(livrable.statut),
                    border: `1px solid ${getStatusColor(livrable.statut)}30`
                  }}
                >
                  {getStatusLabel(livrable.statut)}
                </span>
              </div>
              
              <div className="table-cell">
                {livrable.note ? (
                  <div className="grade-display">
                    <span className="grade-value">{livrable.note}/20</span>
                    {livrable.appreciation && (
                      <span className="grade-appreciation">{livrable.appreciation}</span>
                    )}
                  </div>
                ) : (
                  <span className="no-grade">-</span>
                )}
              </div>
              
              <div className="table-cell">
                <div className="action-buttons">
                  {livrable.statut === 'SOUMIS' && (
                    <>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleSetInCorrection(livrable.id)}
                        disabled={loading}
                      >
                        <i className="fas fa-edit"></i>
                        Corriger
                      </button>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => handleReject(livrable.id)}
                        disabled={loading}
                      >
                        <i className="fas fa-times"></i>
                        Rejeter
                      </button>
                    </>
                  )}
                  
                  {livrable.statut === 'EN_CORRECTION' && (
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => openEvalModal(livrable)}
                      disabled={loading}
                    >
                      <i className="fas fa-check"></i>
                      Évaluer
                    </button>
                  )}
                  
                  <button className="btn btn-sm btn-text">
                    <i className="fas fa-eye"></i>
                    Voir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sortedDeliverables.length > 0 && (
        <Pagination
          totalItems={totalDeliverables}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Vue cartes (alternative) */}
      <div className="deliverables-grid-view">
        <div className="deliverables-grid">
          {sortedDeliverables.map(livrable => (
            <DeliverableCard
              key={livrable.id}
              deliverable={livrable}
              onEvaluate={handleEvaluate}
              onSetInCorrection={handleSetInCorrection}
              onReject={handleReject}
            />
          ))}
        </div>
      </div>

      {/* État vide */}
      {sortedDeliverables.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-file-upload"></i>
          </div>
          <h3>Aucun livrable trouvé</h3>
          <p>
            {deliverables.length === 0 
              ? "Ce projet n'a pas encore de livrables définis"
              : "Aucun livrable ne correspond à vos critères de recherche"
            }
          </p>
          {project.livrables.length === 0 && (
            <button className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Ajouter un livrable
            </button>
          )}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <LoadingSpinner />
          <p>Traitement en cours...</p>
        </div>
      )}

      {/* Modal d'évaluation pour la vue tableau */}
      {evalLivrable && (
        <div className="deliverable-eval-modal">
          <div className="eval-card">
            <h5>Évaluer le livrable</h5>
            <p className="eval-subtitle">{evalLivrable.nom}</p>
            <form onSubmit={handleEvalSubmit}>
              <div className="form-group">
                <label>Note (sur 20)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={evalNote}
                  onChange={(e) => setEvalNote(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Commentaires</label>
                <textarea
                  rows={3}
                  value={evalCommentaires}
                  onChange={(e) => setEvalCommentaires(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="eval-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={closeEvalModal}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-success"
                  disabled={loading || evalNote === ''}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverableList;