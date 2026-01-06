import React, { useState, useRef } from 'react';
import Pagination from './Pagination';

const UserSelector = ({ users, selectedUsers, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const dropdownRef = useRef(null);

  // Supporte les options "groupe" et "membre" (venant de TaskForm)
  const filteredUsers = users.filter(user => {
    if (user.label) {
      // Option générée par TaskForm (groupe ou membre)
      return user.label.toLowerCase().includes(searchTerm.toLowerCase());
    }
    // Fallback: recherche sur nom/prenom/email
    return (
      `${user.prenom || ''} ${user.nom || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const toggleUser = (user) => {
    const isSelected = selectedUsers.some(selected => selected.id === user.id);
    let newSelection = [...selectedUsers];

    if (user.type === 'groupe') {
      // Trouver tous les membres de ce groupe dans la liste users
      const groupMembers = users.filter(u => u.type === 'membre' && u.value?.groupeId === user.value.groupeId);
      const groupAndMembersIds = [user.id, ...groupMembers.map(m => m.id)];
      if (isSelected) {
        // Retirer le groupe ET tous ses membres
        newSelection = newSelection.filter(sel => !groupAndMembersIds.includes(sel.id));
      } else {
        // Ajouter le groupe ET tous ses membres non déjà sélectionnés
        newSelection.push(user);
        groupMembers.forEach(m => {
          if (!newSelection.some(sel => sel.id === m.id)) {
            newSelection.push(m);
          }
        });
      }
    } else {
      // Sélection/déselection standard pour un membre
      if (isSelected) {
        newSelection = newSelection.filter(selected => selected.id !== user.id);
      } else {
        newSelection.push(user);
      }
    }
    onChange(newSelection);
  };

  const removeUser = (userToRemove) => {
    const newSelection = selectedUsers.filter(user => user.id !== userToRemove.id);
    onChange(newSelection);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalUsers = filteredUsers.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="user-selector" ref={dropdownRef}>
      {/* Zone de sélection */}
      <div 
        className="selector-input"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="selected-users">
          {selectedUsers.length === 0 ? (
            <span className="placeholder">{placeholder || 'Sélectionnez des utilisateurs...'}</span>
          ) : (
            selectedUsers.filter(Boolean).map(user => (
              <span key={user.id} className="selected-user">
                {/* Affichage label si présent (groupe/membre), sinon nom/prenom */}
                {user && (user.label || `${user.prenom || ''} ${user.nom || ''}`)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUser(user);
                  }}
                  className="remove-user"
                  disabled={disabled}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className="selector-arrow">
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="selector-dropdown">
          {/* Barre de recherche */}
          <div className="dropdown-search" style={{padding:'8px 12px', background:'#f7fafd', borderBottom:'1px solid #e3eaf2'}}>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1.5px solid #b6c6e3',
                borderRadius: 8,
                fontSize: '1em',
                outline: 'none',
                background: '#fff',
                transition: 'border 0.2s',
                boxShadow: '0 1px 2px rgba(30,60,120,0.04)'
              }}
              onFocus={e => e.target.style.border = '1.5px solid #1976d2'}
              onBlur={e => e.target.style.border = '1.5px solid #b6c6e3'}
            />
          </div>

          {/* Liste des utilisateurs */}
          <div className="dropdown-list">
            {filteredUsers.length === 0 ? (
              <div className="no-results">
                Aucun utilisateur trouvé
              </div>
            ) : (
              paginatedUsers.map(user => {
                const isSelected = selectedUsers.some(selected => selected.id === user.id);
                return (
                  <div
                    key={user.id}
                    className={`user-option ${isSelected ? 'selected' : ''} ${user.type === 'groupe' ? 'user-groupe' : 'user-membre'}`}
                    onClick={() => toggleUser(user)}
                    style={{
                      background: user.type === 'groupe' ? '#f0f6ff' : 'inherit',
                      borderLeft: user.type === 'groupe' ? '4px solid #1976d2' : '4px solid transparent',
                      marginLeft: user.type === 'membre' ? 24 : 0,
                      paddingLeft: user.type === 'membre' ? 8 : 0,
                      display: 'flex', alignItems: 'center', minHeight: 40
                    }}
                  >
                    <div className="user-avatar" style={{
                      background: user.type === 'groupe' ? '#1976d2' : '#90caf9',
                      color: '#fff',
                      fontWeight: 700,
                      marginRight: 10
                    }}>
                      {user.type === 'groupe' ? <i className="fas fa-users"></i> : (user.prenom?.charAt(0) || '') + (user.nom?.charAt(0) || '')}
                    </div>
                    <div className="user-info">
                      <div className="user-name" style={{ fontWeight: user.type === 'groupe' ? 700 : 400, fontSize: user.type === 'groupe' ? '1.05em' : '1em' }}>
                        {user.label || `${user.prenom || ''} ${user.nom || ''}`}
                      </div>
                      {user.type === 'membre' && user.value?.groupeId && (
                        <div className="user-email">
                          <span style={{fontSize:'0.85em',color:'#1976d2',fontWeight:600}}>
                            <i className="fas fa-users" style={{marginRight:4}}></i> {user.groupeNom || ''}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="user-checkbox" style={{marginLeft:'auto'}}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Pagination
            totalItems={totalUsers}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />

          {/* Actions */}
          <div className="dropdown-actions">
            <button
              type="button"
              className="btn btn-text btn-sm"
              onClick={() => setIsOpen(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;