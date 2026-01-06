import React, { useState, useEffect } from 'react';
import Notification from '../../../Common/Notification';
import DeliverableCard from './DeliverableCard';
import SearchFilter from '../../../Common/SearchFilter';
import LoadingSpinner from '../../../UI/LoadingSpinner';
import { deliverableService } from '../../../../services/deliverableService';

const DeliverableManagement = ({ onBack }) => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadDeliverables();
  }, []);

  const loadDeliverables = async () => {
    try {
      setLoading(true);
      const deliverablesData = await deliverableService.getTeacherDeliverables();
      setDeliverables(deliverablesData);
    } catch (error) {
      console.error('Erreur chargement livrables:', error);
    } finally {
      setLoading(false);
    }
  };

  // Liste unique des projets pour le filtre
  const projectOptions = Array.from(
    new Set(deliverables.map(d => d.projet?.nom).filter(Boolean))
  );

  const filteredDeliverables = deliverables.filter(deliverable => {
    const matchesSearch = deliverable.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deliverable.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deliverable.statut === statusFilter;
    const matchesProject = projectFilter === 'all' || (deliverable.projet && deliverable.projet.nom === projectFilter);
    return matchesSearch && matchesStatus && matchesProject;
  });

  const sortedDeliverables = [...filteredDeliverables].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.dateEcheance) - new Date(b.dateEcheance);
      case 'submission':
        return new Date(b.dateSoumission || 0) - new Date(a.dateSoumission || 0);
      case 'project':
        return a.projet.nom.localeCompare(b.projet.nom);
      case 'status':
        const statusOrder = { EN_RETARD: 0, A_SOUMETTRE: 1, SOUMIS: 2, EN_CORRECTION: 3, CORRIGE: 4, REJETE: 5 };
        return statusOrder[a.statut] - statusOrder[b.statut];
      default:
        return 0;
    }
  });

  const handleEvaluate = async (livrableId, note, commentaires) => {
    try {
      await deliverableService.evaluateDeliverable(livrableId, note, commentaires);
      await loadDeliverables(); // Recharger les données
      // Trouver le livrable évalué pour afficher le toast
      const livrable = deliverables.find(d => d.id === livrableId);
      if (livrable && livrable.groupe && Array.isArray(livrable.groupe.etudiants)) {
        const membres = livrable.groupe.etudiants.map(m => m.nom ? `${m.prenom ? m.prenom + ' ' : ''}${m.nom}` : m.email).join(', ');
        setNotification({
          type: 'success',
          message: `Les membres suivants du groupe « ${livrable.groupe.nom || livrable.groupe.libelle || ''} » ont reçu un email : ${membres}`
        });
      } else if (livrable && livrable.groupe) {
        setNotification({
          type: 'success',
          message: `Les membres du groupe « ${livrable.groupe.nom || livrable.groupe.libelle || ''} » ont reçu un email.`
        });
      }
    } catch (error) {
      console.error('Erreur évaluation:', error);
      throw error;
    }
  };

  const handleSetInCorrection = async (livrableId) => {
    try {
      await deliverableService.setDeliverableInCorrection(livrableId);
      await loadDeliverables();
    } catch (error) {
      console.error('Erreur mise en correction:', error);
    }
  };

  const handleReject = async (livrableId) => {
    try {
      await deliverableService.rejectDeliverable(livrableId);
      await loadDeliverables();
    } catch (error) {
      console.error('Erreur rejet:', error);
    }
  };

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
  const hasData = stats.total > 0;

  if (loading) {
    return (
      <div className="deliverable-management-loading">
        <LoadingSpinner />
        <p>Chargement des livrables...</p>
      </div>
    );
  }

  return (
    <div className="management-container deliverable-modern">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={6000}
        />
      )}
      {/* En-tête sticky avec actions */}
      <div className="page-header sticky-header">
        <div className="header-content">
          <div className="header-nav">
            {/* Bouton retour supprimé */}
          </div>
          <h1>Gestion des Livrables</h1>
          <p>Corrigez et évaluez les travaux soumis par les étudiants</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-outline"
            onClick={() => {
              // Export CSV simple des livrables pour le suivi pédagogique
              const headers = [
                'Projet',
                'Groupe',
                'Livrable',
                'Statut',
                'Note',
                'Date échéance',
                'Date soumission'
              ];
              const rows = deliverables.map(d => [
                d.projet?.nom || '',
                d.groupe?.nom || '',
                d.nom || '',
                d.statut || '',
                d.note != null ? d.note : '',
                d.dateEcheance || '',
                d.dateSoumission || ''
              ]);
              const csvContent = [headers, ...rows]
                .map(r => r.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
                .join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'livrables.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
          >
            <i className="fas fa-download"></i>
            Exporter
          </button>
          <div className="deliverable-stats-inline">
            {hasData ? (
              <>
                <span className="stats-label">Résumé :</span>
                <span className="stats-chip">
                  <i className="fas fa-layer-group"></i>
                  {stats.total} livrable{stats.total > 1 ? 's' : ''}
                </span>
                {stats.submitted > 0 && (
                  <span className="stats-chip">
                    <i className="fas fa-paper-plane"></i>
                    {stats.submitted} soumis
                  </span>
                )}
                {stats.inCorrection > 0 && (
                  <span className="stats-chip">
                    <i className="fas fa-pen"></i>
                    {stats.inCorrection} en correction
                  </span>
                )}
                {stats.corrected > 0 && (
                  <span className="stats-chip">
                    <i className="fas fa-check-circle"></i>
                    {stats.corrected} corrigé{stats.corrected > 1 ? 's' : ''}
                  </span>
                )}
                {stats.delayed > 0 && (
                  <span className="stats-chip stats-chip-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    {stats.delayed} en retard
                  </span>
                )}
              </>
            ) : (
              <span className="stats-label">Aucun livrable pour le moment</span>
            )}
          </div>
        </div>
      </div>


      {/* Filtres sticky */}
      <div className="filters-section sticky-filters">
        <div className="filters-left" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher un livrable..."
          />
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="filter-select"
            style={{minWidth: 160}}
          >
            <option value="all">Tous les projets</option>
            {projectOptions.map(nom => (
              <option key={nom} value={nom}>{nom}</option>
            ))}
          </select>
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
            <option value="project">Projet</option>
            <option value="status">Statut</option>
          </select>
        </div>
      </div>

      {/* Liste des livrables */}
      <div className="deliverables-container modern-grid">
        {sortedDeliverables.length > 0 ? (
          <div className="items-grid modern-grid">
            {sortedDeliverables.map(deliverable => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                onEvaluate={handleEvaluate}
                onSetInCorrection={handleSetInCorrection}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state modern-empty">
            <div className="empty-icon">
              <i className="fas fa-file-upload"></i>
            </div>
            <h3>Aucun livrable trouvé</h3>
            <p>
              {deliverables.length === 0 
                ? "Aucun livrable n'a été soumis pour le moment"
                : "Aucun livrable ne correspond à vos critères de recherche"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliverableManagement;