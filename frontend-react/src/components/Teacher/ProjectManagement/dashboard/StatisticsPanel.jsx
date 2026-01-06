import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, LabelList
} from 'recharts';
import { groupService } from '../../../../services/groupService';
import './StatisticsPanel.css';

const StatisticsPanel = ({ projects, getProjectTasks, onBack }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [activeChart, setActiveChart] = useState('overview');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [groupes, setGroupes] = useState([]);

  useEffect(() => {
    calculateStatistics();
  }, [projects, timeRange]);

  useEffect(() => {
    // Chargement des groupes pour la courbe Distribution des notes
    groupService.getGroups().then(data => {
      setGroupes(Array.isArray(data) ? data : []);
    }).catch(() => setGroupes([]));
  }, []);

  const calculateStatistics = () => {
    setLoading(true);
    
    // Calcul des statistiques de base
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.statut === 'EN_COURS').length;
    const completedProjects = projects.filter(p => p.statut === 'TERMINE').length;
    const plannedProjects = projects.filter(p => p.statut === 'PLANIFIE').length;
    
    // Calcul des tâches (en utilisant la fonction getProjectTasks si fournie)
    const allTasks = projects.flatMap(p => {
      if (typeof getProjectTasks === 'function') {
        return getProjectTasks(p.id) || [];
      }
      return p.taches || [];
    });
    const completedTasks = allTasks.filter(t => t.statut === 'TERMINEE').length;
    const delayedTasks = allTasks.filter(t => t.statut === 'EN_RETARD').length;
    const inProgressTasks = allTasks.filter(t => t.statut === 'EN_COURS').length;
    
    // Progression moyenne
    const averageProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + (p.pourcentageAvancement || 0), 0) / projects.length
      : 0;

    // Données pour les graphiques
    const projectStatusData = [
      { name: 'En cours', value: activeProjects, color: '#3b82f6' },
      { name: 'Terminés', value: completedProjects, color: '#10b981' },
      { name: 'Planifiés', value: plannedProjects, color: '#6b7280' },
      { name: 'Annulés', value: projects.filter(p => p.statut === 'ANNULE').length, color: '#ef4444' }
    ];

    // Statuts dynamiques pour les tâches
    const statusLabels = {
      'A_FAIRE': 'À faire',
      'EN_COURS': 'En cours',
      'EN_ATTENTE': 'En attente',
      'BLOQUE': 'Bloquée',
      'EN_REVUE': 'En revue',
      'TERMINEE': 'Terminée',
      'EN_RETARD': 'En retard',
      'ANNULEE': 'Annulée',
      'ARCHIVEE': 'Archivée',
    };
    const statusColors = {
      'A_FAIRE': '#6b7280',
      'EN_COURS': '#3b82f6',
      'EN_ATTENTE': '#f59e42',
      'BLOQUE': '#ef4444',
      'EN_REVUE': '#a855f7',
      'TERMINEE': '#10b981',
      'EN_RETARD': '#ef4444',
      'ANNULEE': '#9ca3af',
      'ARCHIVEE': '#d1d5db',
    };
    const statusCounts = {};
    allTasks.forEach(t => {
      statusCounts[t.statut] = (statusCounts[t.statut] || 0) + 1;
    });
    const taskStatusData = Object.entries(statusCounts).map(([statut, value]) => ({
      name: statusLabels[statut] || statut,
      value,
      color: statusColors[statut] || '#8884d8',
    }));

    // Données de progression temporelle basées sur les vrais projets
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const progressBuckets = {};

    projects.forEach((project) => {
      const refDate = project.dateFin || project.dateDebut;
      if (!refDate) return;

      const d = new Date(refDate);
      if (Number.isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${d.getMonth()}`; // ex: 2025-0 pour Jan 2025
      if (!progressBuckets[key]) {
        progressBuckets[key] = { totalProgress: 0, count: 0 };
      }
      progressBuckets[key].totalProgress += project.pourcentageAvancement || 0;
      progressBuckets[key].count += 1;
    });

    const progressOverTime = Object.entries(progressBuckets)
      .sort(([a], [b]) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
      })
      .map(([key, value]) => {
        const [year, monthIndex] = key.split('-').map(Number);
        const avgProgress = value.count > 0 ? Math.round(value.totalProgress / value.count) : 0;
        return {
          month: `${monthNames[monthIndex]} ${String(year).slice(2)}`,
          progression: avgProgress,
          projets: value.count,
        };
      });

    // Performance par projet
    const projectPerformance = projects.map(project => ({
      name: project.nom.length > 15 ? project.nom.substring(0, 15) + '...' : project.nom,
      progression: project.pourcentageAvancement || 0,
      tachesTerminees: (project.taches || []).filter(t => t.statut === 'TERMINEE').length,
      tachesTotal: (project.taches || []).length,
      tauxCompletion: project.taches && project.taches.length > 0 
        ? Math.round(((project.taches || []).filter(t => t.statut === 'TERMINEE').length / project.taches.length) * 100)
        : 0
    })).sort((a, b) => b.tauxCompletion - a.tauxCompletion);

    // Identification des éléments à risque pour la vue "Risques"
    const now = new Date();
    const riskProjects = projects
      .map(project => {
        const projectTasks = (typeof getProjectTasks === 'function'
          ? getProjectTasks(project.id)
          : project.taches) || [];

        const projectDelayedTasks = projectTasks.filter(t => t.statut === 'EN_RETARD');
        const hasNearDeadline = project.dateFin
          ? (new Date(project.dateFin) - now) / (1000 * 60 * 60 * 24) <= 3
          : false;

        const riskScore =
          (projectDelayedTasks.length > 0 ? 2 : 0) +
          (hasNearDeadline ? 1 : 0) +
          ((project.pourcentageAvancement || 0) < 30 ? 1 : 0);

        return {
          id: project.id,
          name: project.nom,
          statut: project.statut,
          progression: project.pourcentageAvancement || 0,
          delayedTasks: projectDelayedTasks.length,
          totalTasks: projectTasks.length,
          daysToDeadline: project.dateFin
            ? Math.round((new Date(project.dateFin) - now) / (1000 * 60 * 60 * 24))
            : null,
          riskScore
        };
      })
      .filter(p => p.riskScore > 0)
      .sort((a, b) => b.riskScore - a.riskScore);

    setStats({
      totalProjects,
      activeProjects,
      completedProjects,
      plannedProjects,
      totalTasks: allTasks.length,
      completedTasks,
      delayedTasks,
      inProgressTasks,
      averageProgress: Math.round(averageProgress),
      projectStatusData,
      taskStatusData,
      progressOverTime,
      projectPerformance,
      riskProjects
    });

    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Préparer les données pour la courbe Distribution des notes (TOTAL)
  const groupesWithNotes = groupes.map(g => ({
    ...g,
    tech: g.tech || Math.floor(Math.random() * 10) + 1,
    besoins: g.besoins || Math.floor(Math.random() * 10) + 1,
    original: g.original || Math.floor(Math.random() * 10) + 1,
    doc: g.doc || Math.floor(Math.random() * 10) + 1,
    total: g.total || (g.tech || 0) + (g.besoins || 0) + (g.original || 0) + (g.doc || 0),
  }));
  const chartData = groupesWithNotes.map(g => ({
    name: g.nom,
    Note: g.total,
  }));

  const renderOverviewCharts = () => (
    <div className="overview-grid">
      {/* Graphique de statut des projets */}
      <div className="chart-card">
        <h4>Répartition des Projets</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.projectStatusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {stats.projectStatusData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique de statut des tâches */}
      <div className="chart-card">
        <h4>Statut des Tâches</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.taskStatusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8">
              {stats.taskStatusData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Progression dans le temps */}
      <div className="chart-card full-width">
        <h4>Progression Globale</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stats.progressOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="progression" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            <Line type="monotone" dataKey="projets" stroke="#10b981" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Distribution des notes (TOTAL) */}
      <div className="chart-card full-width">
        <h4 className="comparaison-title-centered" style={{marginBottom: '1.2rem'}}>Distribution des notes (TOTAL)</h4>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{fontSize: 13}} />
            <YAxis domain={[0, Math.max(...chartData.map(d => d.Note), 10)]} tick={{fontSize: 13}} allowDecimals={false} />
            <Tooltip cursor={{fill: '#f3f6fa'}} />
            <Bar dataKey="Note" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={38}>
              <LabelList dataKey="Note" position="top" style={{fontWeight: 600, fill: '#222'}} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPerformanceCharts = () => (
    <div className="performance-grid">
      {/* Performance par projet */}
      <div className="chart-card full-width">
        <h4>Performance par Projet</h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stats.projectPerformance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip formatter={(value) => [`${value}%`, 'Taux de complétion']} />
            <Legend />
            <Bar dataKey="tauxCompletion" name="Taux de complétion" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Détails de performance */}
      <div className="performance-details">
        <h4>Métriques de Performance</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{stats.averageProgress}%</div>
            <div className="metric-label">Progression moyenne</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.completedProjects}</div>
            <div className="metric-label">Projets terminés</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
            </div>
            <div className="metric-label">Taux de complétion tâches</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.delayedTasks}</div>
            <div className="metric-label">Tâches en retard</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailedStats = () => (
    <div className="detailed-stats">
      <div className="stats-grid-detailed">
        <div className="stat-card-large">
          <div className="stat-icon">
            <i className="fas fa-project-diagram"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalProjects}</div>
            <div className="stat-label">Projets Totaux</div>
            <div className="stat-breakdown">
              <span className="breakdown-item">
                <span className="dot active"></span>
                {stats.activeProjects} actifs
              </span>
              <span className="breakdown-item">
                <span className="dot completed"></span>
                {stats.completedProjects} terminés
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon">
            <i className="fas fa-tasks"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTasks}</div>
            <div className="stat-label">Tâches Totales</div>
            <div className="stat-breakdown">
              <span className="breakdown-item">
                <span className="dot completed"></span>
                {stats.completedTasks} terminées
              </span>
              <span className="breakdown-item">
                <span className="dot delayed"></span>
                {stats.delayedTasks} en retard
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.averageProgress}%</div>
            <div className="stat-label">Progression Moyenne</div>
            <div className="progress-bar-large">
              <div 
                className="progress-fill-large"
                style={{ width: `${stats.averageProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {stats.totalTasks > 0 ? Math.round((stats.delayedTasks / stats.totalTasks) * 100) : 0}%
            </div>
            <div className="stat-label">Taux de Retard</div>
            <div className="stat-trend negative">
              <i className="fas fa-arrow-up"></i>
              Nécessite attention
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRiskView = () => (
    <div className="risk-view">
      {(!stats.riskProjects || stats.riskProjects.length === 0) ? (
        <div className="empty-state modern-empty">
          <div className="empty-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h3>Aucun risque majeur détecté</h3>
          <p>
            Aucun projet ne présente actuellement de retard ou de risque important.
          </p>
        </div>
      ) : (
        <div className="risk-table-wrapper">
          <table className="risk-table">
            <thead>
              <tr>
                <th>Projet</th>
                <th>Statut</th>
                <th>Tâches en retard</th>
                <th>Progression</th>
                <th>Jours avant échéance</th>
                <th>Niveau de risque</th>
              </tr>
            </thead>
            <tbody>
              {stats.riskProjects.map(project => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.statut}</td>
                  <td className={project.delayedTasks > 0 ? 'text-danger' : ''}>
                    {project.delayedTasks}
                  </td>
                  <td>
                    <div className="risk-progress-bar">
                      <div
                        className="risk-progress-fill"
                        style={{ width: `${project.progression}%` }}
                      />
                      <span className="risk-progress-label">{project.progression}%</span>
                    </div>
                  </td>
                  <td>
                    {project.daysToDeadline !== null
                      ? `${project.daysToDeadline} j`
                      : '—'}
                  </td>
                  <td>
                    <span
                      className={`risk-badge ${
                        project.riskScore >= 3
                          ? 'high'
                          : project.riskScore === 2
                          ? 'medium'
                          : 'low'
                      }`}
                    >
                      {project.riskScore >= 3
                        ? 'Élevé'
                        : project.riskScore === 2
                        ? 'Modéré'
                        : 'Faible'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="statistics-panel">
        <div className="panel-header">
          <h1>Statistiques</h1>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Calcul des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-panel">
      {/* En-tête */}
      <div className="panel-header">
        <div className="header-left">
          <h1>Analytiques et Statistiques</h1>
          <p>Vue détaillée des performances et métriques de vos projets</p>
        </div>
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Navigation des graphiques */}
      <div className="chart-navigation">
        <button 
          className={`nav-btn ${activeChart === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveChart('overview')}
        >
          <i className="fas fa-chart-pie"></i>
          Vue d'ensemble
        </button>
        <button 
          className={`nav-btn ${activeChart === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveChart('performance')}
        >
          <i className="fas fa-chart-bar"></i>
          Performance
        </button>
        <button 
          className={`nav-btn ${activeChart === 'detailed' ? 'active' : ''}`}
          onClick={() => setActiveChart('detailed')}
        >
          <i className="fas fa-table"></i>
          Statistiques détaillées
        </button>
        <button 
          className={`nav-btn ${activeChart === 'risks' ? 'active' : ''}`}
          onClick={() => setActiveChart('risks')}
        >
          <i className="fas fa-exclamation-triangle"></i>
          Risques
        </button>
      </div>

      {/* Contenu des graphiques */}
      <div className="panel-content">
        {activeChart === 'overview' && renderOverviewCharts()}
        {activeChart === 'performance' && renderPerformanceCharts()}
        {activeChart === 'detailed' && renderDetailedStats()}
        {activeChart === 'risks' && renderRiskView()}
      </div>

      {/* Actions */}
      <div className="panel-actions">
        <button
          className="btn btn-outline"
          onClick={() => {
            // Export CSV simple des projets avec quelques métriques clés
            const headers = [
              'Projet',
              'Statut',
              'Progression',
              'Tâches terminées',
              'Tâches en retard'
            ];
            const rows = (stats.projectPerformance || []).map(p => [
              p.name,
              '',
              `${p.progression}%`,
              p.tachesTerminees,
              ''
            ]);
            const csvContent = [headers, ...rows]
              .map(r => r.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
              .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'statistiques_projets.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
        >
          <i className="fas fa-download"></i>
          Exporter les données
        </button>
        <button
          className="btn btn-outline"
          onClick={() => window.print()}
        >
          <i className="fas fa-print"></i>
          Imprimer le rapport
        </button>
        <button className="btn btn-primary">
          <i className="fas fa-sync"></i>
          Actualiser les données
        </button>
      </div>
    </div>
  );
};

export default StatisticsPanel;