import React from 'react';

const FilePreview = ({ file }) => {
  const getFileIcon = (fileType) => {
    const icons = {
      pdf: 'fas fa-file-pdf',
      document: 'fas fa-file-word',
      image: 'fas fa-file-image',
      archive: 'fas fa-file-archive',
      text: 'fas fa-file-alt',
      excel: 'fas fa-file-excel',
      default: 'fas fa-file'
    };

    return icons[file.type] || icons.default;
  };

  const getFileColor = (fileType) => {
    const colors = {
      pdf: '#f40f02',
      document: '#2b579a',
      image: '#36b37e',
      archive: '#ff8b00',
      text: '#757575',
      excel: '#217346',
      default: '#757575'
    };

    return colors[file.type] || colors.default;
  };

  const handleDownload = () => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className="file-preview">
      <div 
        className="file-icon"
        style={{ color: getFileColor(file.type) }}
        onClick={handleDownload}
      >
        <i className={getFileIcon(file.type)}></i>
      </div>
      
      <div className="file-info">
        <div className="file-name" onClick={handleDownload}>
          {file.nom}
        </div>
        <div className="file-meta">
          <span className="file-size">{file.getTailleFormatee?.() || '0 B'}</span>
          <span className="file-type">{file.type}</span>
        </div>
      </div>

      <button 
        className="btn btn-icon download-btn"
        onClick={handleDownload}
        title="Télécharger"
      >
        <i className="fas fa-download"></i>
      </button>
    </div>
  );
};

export default FilePreview;