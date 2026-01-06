import React, { useState } from "react";
import './QuickProjectFilters.css';

const QuickProjectFilters = ({
  groups = [],
  projects = [],
  onFilterChange,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState({
    all: initialFilters.all ?? true,
    notEvaluated: initialFilters.notEvaluated ?? false,
    groupId: initialFilters.groupId ?? '',
    projectId: initialFilters.projectId ?? ''
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'all' && value) {
      newFilters.notEvaluated = false;
    }
    if (key === 'notEvaluated' && value) {
      newFilters.all = false;
    }
    setFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  return (
    <div className="quick-filters-bar">
      <div className="quick-filters-left">
        <button
          className={`quick-filter-btn${filters.all ? ' active' : ''}`}
          onClick={() => handleChange('all', true)}
        >
          Tous les projets
        </button>
        <button
          className={`quick-filter-btn${filters.notEvaluated ? ' active' : ''}`}
          onClick={() => handleChange('notEvaluated', true)}
        >
          Non évalués
        </button>
      </div>
      <div className="quick-filters-right">
        <select
          className="quick-filter-select"
          value={filters.groupId}
          onChange={e => handleChange('groupId', e.target.value)}
        >
          <option value="">Sélectionner groupe...</option>
          {groups.map(g => (
            <option key={g.id || g._id} value={g.id || g._id}>
              {g.nom} ({g.etudiants?.length || g.membres?.length || 0} membres)
            </option>
          ))}
        </select>
        <select
          className="quick-filter-select"
          value={filters.projectId}
          onChange={e => handleChange('projectId', e.target.value)}
        >
          <option value="">Sélectionner projet...</option>
          {projects.map(p => (
            <option key={p.id || p._id} value={p.id || p._id}>
              {p.nom}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default QuickProjectFilters;
