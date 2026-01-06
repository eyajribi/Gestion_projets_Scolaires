import React, { useState, useEffect, useRef } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher...",
  onSearch,
  onClear,
  delay = 300,
  size = "md",
  variant = "default",
  className = "",
  disabled = false,
  showClearButton = true,
  autoFocus = false
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Synchronisation avec la valeur externe
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  // Gestion du debounce pour la recherche
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (internalValue !== value) {
      timeoutRef.current = setTimeout(() => {
        onChange(internalValue);
        if (onSearch && internalValue.trim()) {
          onSearch(internalValue.trim());
        }
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [internalValue, delay, onChange, onSearch, value]);

  const handleChange = (e) => {
    setInternalValue(e.target.value);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && onSearch) {
      onSearch(internalValue.trim());
    }
  };

  const getInputClass = () => {
    const baseClass = `search-filter-input size-${size} variant-${variant}`;
    const stateClass = isFocused ? 'focused' : '';
    const clearClass = internalValue ? 'has-value' : '';
    const disabledClass = disabled ? 'disabled' : '';
    
    return `${baseClass} ${stateClass} ${clearClass} ${disabledClass} ${className}`.trim();
  };

  return (
    <div className="search-filter-container">
      <div className="search-filter-wrapper">
        {/* Icône de recherche */}
        <div className="search-icon">
          <i className="fas fa-search"></i>
        </div>

        {/* Champ de recherche */}
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={getInputClass()}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label="Rechercher"
        />

        {/* Bouton de suppression */}
        {showClearButton && internalValue && !disabled && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
            aria-label="Effacer la recherche"
          >
            <i className="fas fa-times"></i>
          </button>
        )}

        {/* Indicateur de chargement (optionnel) */}
        {disabled && (
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        )}
      </div>

      {/* Suggestions (optionnel - peut être étendu) */}
      {isFocused && internalValue && (
        <div className="search-suggestions">
          {/* Les suggestions peuvent être implémentées ici */}
        </div>
      )}
    </div>
  );
};

// Version avec suggestions avancées
export const AdvancedSearchFilter = ({ 
  value,
  onChange,
  placeholder = "Rechercher...",
  filters = [],
  onFilterChange,
  onSearch,
  ...props 
}) => {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]?.value || '');

  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue);
    if (onFilterChange) {
      onFilterChange(filterValue);
    }
  };

  return (
    <div className="advanced-search-filter">
      {/* Sélecteur de filtre */}
      {filters.length > 0 && (
        <div className="filter-selector">
          <select 
            value={selectedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-dropdown"
          >
            {filters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Champ de recherche */}
      <SearchFilter
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onSearch={onSearch}
        {...props}
      />
    </div>
  );
};

// Version avec historique de recherche
export const SearchFilterWithHistory = ({ 
  searchHistory = [],
  onSearchFromHistory,
  maxHistoryItems = 5,
  ...props 
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const handleHistoryItemClick = (historyItem) => {
    if (onSearchFromHistory) {
      onSearchFromHistory(historyItem);
    }
    setShowHistory(false);
  };

  const clearHistory = () => {
    // Implémentation pour vider l'historique
  };

  return (
    <div className="search-with-history">
      <SearchFilter
        onFocus={() => setShowHistory(true)}
        {...props}
      />
      
      {showHistory && searchHistory.length > 0 && (
        <div className="search-history">
          <div className="history-header">
            <span>Recherches récentes</span>
            <button 
              className="btn btn-text btn-sm"
              onClick={clearHistory}
            >
              Effacer
            </button>
          </div>
          <div className="history-list">
            {searchHistory.slice(0, maxHistoryItems).map((item, index) => (
              <button
                key={index}
                className="history-item"
                onClick={() => handleHistoryItemClick(item)}
              >
                <i className="fas fa-history"></i>
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;