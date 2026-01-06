import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProgressChart = ({ project, detailed = false }) => {
  if (!project) return null;

  // Données pour le graphique circulaire (vue simple)
  const pieData = [
    { name: 'Terminées', value: Number(project.taches?.filter(t => t.statut === 'TERMINEE').length) || 0, color: '#10b981' },
    { name: 'En cours', value: Number(project.taches?.filter(t => t.statut === 'EN_COURS').length) || 0, color: '#3b82f6' },
    { name: 'À faire', value: Number(project.taches?.filter(t => t.statut === 'A_FAIRE').length) || 0, color: '#6b7280' },
    { name: 'En retard', value: Number(project.taches?.filter(t => t.statut === 'EN_RETARD').length) || 0, color: '#ef4444' }
  ];

  // Données pour le graphique en barres (vue détaillée)
  const barData = [
    {
      name: 'Tâches',
      'Terminées': Number(project.taches?.filter(t => t.statut === 'TERMINEE').length) || 0,
      'En cours': Number(project.taches?.filter(t => t.statut === 'EN_COURS').length) || 0,
      'À faire': Number(project.taches?.filter(t => t.statut === 'A_FAIRE').length) || 0,
      'En retard': Number(project.taches?.filter(t => t.statut === 'EN_RETARD').length) || 0
    }
  ];

  // Données pour l'avancement par groupe (si disponible)
  const groupProgressData = project.groupes?.map(groupe => ({
    name: groupe.nom,
    Avancement: Number(groupe.pourcentageAvancement) || 0,
    TâchesTerminées: Number(groupe.taches?.filter(t => t.statut === 'TERMINEE').length) || 0,
    TotalTâches: Number(groupe.taches?.length) || 0
  })) || [];

  // Configuration des couleurs
  const COLORS = {
    terminées: '#10b981',
    en_cours: '#3b82f6',
    a_faire: '#6b7280',
    en_retard: '#ef4444'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-content">
            <p className="tooltip-label">{label}</p>
            {payload.map((entry, index) => (
              <p key={index} className="tooltip-item" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (detailed) {
    return (
      <div className="progress-chart-detailed">
        <div className="chart-grid">
          {/* Graphique en barres - Vue d'ensemble */}
          <div className="chart-card">
            <h4>Répartition des tâches</h4>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Terminées" fill={COLORS.terminées} />
                  <Bar dataKey="En cours" fill={COLORS.en_cours} />
                  <Bar dataKey="À faire" fill={COLORS.a_faire} />
                  <Bar dataKey="En retard" fill={COLORS.en_retard} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique circulaire - Pourcentage */}
          <div className="chart-card">
            <h4>Avancement global</h4>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[{ 
                      name: 'Complété', 
                      value: project.pourcentageAvancement || 0,
                      color: COLORS.terminées 
                    }, { 
                      name: 'Restant', 
                      value: 100 - (project.pourcentageAvancement || 0),
                      color: COLORS.a_faire
                    }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <text 
                    x="50%" 
                    y="50%" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="progress-percentage"
                  >
                    {Number.isFinite(Number(project.pourcentageAvancement)) ? Math.round(Number(project.pourcentageAvancement)) : 0}%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Avancement par groupe */}
          {groupProgressData.length > 0 && (
            <div className="chart-card full-width">
              <h4>Avancement par groupe</h4>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={groupProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="TâchesTerminées" 
                      fill={COLORS.terminées} 
                      name="Tâches terminées"
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="TotalTâches" 
                      fill={COLORS.a_faire} 
                      name="Total tâches"
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="Avancement" 
                      fill={COLORS.en_cours} 
                      name="% Avancement"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Statistiques détaillées */}
          <div className="stats-card">
            <h4>Métriques détaillées</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-value">
                  {project.taches?.length || 0}
                </div>
                <div className="metric-label">Total tâches</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">
                  {project.taches?.length > 0 ? Math.round((project.taches?.filter(t => t.statut === 'TERMINEE').length / project.taches?.length) * 100) : 0}%
                </div>
                <div className="metric-label">Taux de complétion</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">
                  {project.taches?.filter(t => t.priorite === 'HAUTE').length || 0}
                </div>
                <div className="metric-label">Tâches prioritaires</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">
                  {project.livrables?.length || 0}
                </div>
                <div className="metric-label">Livrables</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue simple (pour l'onglet vue d'ensemble)
  return (
    <div className="progress-chart-simple">
      <div className="chart-header">
        <h4>Progression du projet</h4>
        <span className="progress-text">
          {Number.isFinite(Number(project.pourcentageAvancement)) ? Math.round(Number(project.pourcentageAvancement)) : 0}% complété
        </span>
      </div>
      
      <div className="chart-content">
        <div className="pie-chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-legend">
          {pieData.map((item, index) => (
            <div key={item.name} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="legend-label">{item.name}</span>
              <span className="legend-value">({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Barre de progression linéaire */}
      <div className="progress-bar-container">
        <div className="progress-bar-labels">
          <span>Avancement global</span>
          <span>{Number.isFinite(Number(project.pourcentageAvancement)) ? Math.round(Number(project.pourcentageAvancement)) : 0}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Number.isFinite(Number(project.pourcentageAvancement)) ? Math.round(Number(project.pourcentageAvancement)) : 0}%`,
              backgroundColor: COLORS.terminées
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;