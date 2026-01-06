import React from 'react';

const getPriorityStyle = (priorite) => {
  switch (priorite) {
    case 'URGENTE':
      return { background: '#f87171', color: '#fff', border: '1.5px solid #b91c1c' };
    case 'HAUTE':
      return { background: '#fde68a', color: '#92400e', border: '1.5px solid #92400e' };
    case 'MOYENNE':
      return { background: '#fef3c7', color: '#b45309', border: '1.5px solid #b45309' };
    case 'BASSE':
      return { background: '#e0f2fe', color: '#0369a1', border: '1.5px solid #0369a1' };
    default:
      return { background: '#e5e7eb', color: '#374151', border: '1.5px solid #9ca3af' };
  }
};

const PriorityBadge = ({ priorite }) => (
  <span style={{
    display: 'inline-block',
    borderRadius: 12,
    padding: '2px 12px',
    fontWeight: 700,
    fontSize: 14,
    ...getPriorityStyle(priorite)
  }}>
    {priorite}
  </span>
);

export default PriorityBadge;