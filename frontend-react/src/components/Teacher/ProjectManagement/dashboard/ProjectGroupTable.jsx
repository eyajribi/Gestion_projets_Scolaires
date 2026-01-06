import React from "react";
import './ProjectGroupTable.css';

function getStars(note) {
  // note: number (0-5)
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (note >= i) stars.push(<i key={i} className="fas fa-star" style={{color:'#fbbf24'}}></i>);
    else stars.push(<i key={i} className="fas fa-circle" style={{color:'#d1d5db', fontSize:10}}></i>);
  }
  return stars;
}

const getEtatLabel = (note, noteRaw) => {
  if (noteRaw == null || noteRaw === 0) return 'Non évalué';
  if (noteRaw > 0 && noteRaw < 15) return 'Partiellement évalué';
  if (noteRaw >= 15) return 'Terminé';
  return '';
};

const ProjectGroupTable = ({ rows }) => {
  return (
    <div className="project-group-table-wrapper">
      <table className="project-group-table">
        <thead>
          <tr>
            <th>Groupe</th>
            <th>Projet</th>
            <th>État</th>
            <th>Dernière modif.</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={4} style={{textAlign:'center',color:'#888'}}>Aucun résultat</td></tr>
          ) : rows.map((row, idx) => (
            <tr key={row.groupId + '-' + row.projectId + '-' + idx}>
              <td>
                <span className="group-name">{row.groupName}</span>
                <span className="group-members">({row.membersCount} membres)</span>
              </td>
              <td>{row.projectName}</td>
              <td>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:2}}>
                  <span style={{fontWeight:600}}>{getEtatLabel(row.note, row.noteRaw)}</span>
                  <span>{getStars(row.note)}</span>
                </div>
              </td>
              <td>{row.lastModified ? new Date(row.lastModified).toLocaleDateString('fr-FR') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectGroupTable;
