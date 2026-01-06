import React from 'react';
import './Pagination.css';

const Pagination = ({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  if (!totalItems || totalItems <= pageSize) {
    return null;
  }

  const totalPages = Math.ceil(totalItems / pageSize);
  const safeCurrent = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrent - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrent * pageSize, totalItems);

  const handlePrevious = () => {
    if (safeCurrent > 1) {
      onPageChange(safeCurrent - 1);
    }
  };

  const handleNext = () => {
    if (safeCurrent < totalPages) {
      onPageChange(safeCurrent + 1);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value) || pageSize;
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  const canGoPrev = safeCurrent > 1;
  const canGoNext = safeCurrent < totalPages;

  return (
    <div className="pagination">
      <div className="pagination-info">
        <span>
          Affichage de {startIndex} à {endIndex} sur {totalItems} élément(s)
        </span>
      </div>

      <div className="pagination-controls">
        {onPageSizeChange && (
          <div className="page-size-selector">
            <label>Par page :</label>
            <select value={pageSize} onChange={handlePageSizeChange}>
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="page-buttons">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrevious}
            disabled={!canGoPrev}
          >
	    Précédent
          </button>
          <span className="page-indicator">
            Page {safeCurrent} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleNext}
            disabled={!canGoNext}
          >
	    Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
