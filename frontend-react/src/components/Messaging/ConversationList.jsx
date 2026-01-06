import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';
import api from '../../services/api';
import './messaging.css';

const ConversationList = ({ onSelect, selectedId }) => {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewConv, setShowNewConv] = useState(false);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const { user } = useAuth();
  const enseignantId = user?.id;

  // Simuler quelques groupes pour le design
  const mockGroups = useMemo(() => [
    { id: 1, nom: 'Groupe A - Mathématiques', membres: 24, active: true },
    { id: 2, nom: 'Groupe B - Physique', membres: 18, active: false },
    { id: 3, nom: 'Projet Final - Informatique', membres: 32, active: true },
    { id: 4, nom: 'Tutorat Anglais', membres: 12, active: true },
    { id: 5, nom: 'Club Robotique', membres: 28, active: false },
  ], []);

  useEffect(() => {
    if (!enseignantId) return;
    setLoading(true);
    api.get(`/api/messagerie/conversations/enseignant/${enseignantId}`)
      .then(data => {
        // Récupérer les groupes pour enrichir l'affichage
        groupService.getGroups().then(allGroups => {
          const enhancedConversations = data.map(conv => ({
            ...conv,
            group: allGroups.find(g => g.id === conv.groupeId) || { nom: `Groupe ${conv.groupeId}` },
            lastActive: conv.dateDernierMessage || new Date().toISOString(),
            unread: Math.random() > 0.5,
            online: Math.random() > 0.7,
          }));
          setConversations(enhancedConversations);
        });
      })
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [enseignantId]);

  // Récupérer tous les groupes pour la création de conversation
  useEffect(() => {
    if (showNewConv) {
      setModalLoading(true);
      groupService.getGroups()
        .then(grs => {
          setGroups(grs);
          setFilteredGroups(grs);
        })
        .catch(() => setModalError('Erreur chargement groupes'))
        .finally(() => setModalLoading(false));
    }
  }, [showNewConv]);

  useEffect(() => {
    if (groupSearch && groups.length > 0) {
      setFilteredGroups(groups.filter(g => g.nom.toLowerCase().includes(groupSearch.toLowerCase())));
    } else {
      setFilteredGroups(groups);
    }
  }, [groupSearch, groups]);

  // Récupérer les membres du groupe sélectionné
  useEffect(() => {
    if (selectedGroup) {
      setModalLoading(true);
      groupService.getGroupStudents(selectedGroup.id)
        .then(setGroupMembers)
        .catch(() => setModalError('Erreur chargement membres'))
        .finally(() => setModalLoading(false));
    } else {
      setGroupMembers([]);
    }
  }, [selectedGroup]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv =>
      conv.group.nom.toLowerCase().includes(search.toLowerCase()) ||
      conv.dernierMessage?.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="conversation-list">
      <div className="conversation-search">
        <div className="search-input">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
              stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>
        <button className="new-conversation-btn" onClick={() => setShowNewConv(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Modal création conversation */}
      {showNewConv && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nouvelle conversation</h3>
            <button className="close-modal" onClick={() => {
              setShowNewConv(false);
              setSelectedGroup(null);
              setGroupSearch('');
              setModalError(null);
            }}>×</button>
            <div className="modal-section">
              <label>Rechercher un groupe :</label>
              <input
                type="text"
                placeholder="Nom du groupe..."
                value={groupSearch}
                onChange={e => setGroupSearch(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <div className="group-list-modal">
                {modalLoading ? (
                  <div className="modal-loading">Chargement...</div>
                ) : filteredGroups.length === 0 ? (
                  <div className="modal-empty">Aucun groupe trouvé</div>
                ) : (
                  filteredGroups.map(g => (
                    <div
                      key={g.id}
                      className={`group-select-item${selectedGroup?.id === g.id ? ' selected' : ''}`}
                      onClick={() => setSelectedGroup(g)}
                      style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '6px 0' }}
                    >
                      {g.photoUrl ? (
                        <img src={g.photoUrl} alt={g.nom} className="avatar-small" style={{ marginRight: 8, objectFit: 'cover' }} />
                      ) : (
                        <div className="avatar-small" style={{ marginRight: 8 }}>{g.nom.charAt(0)}</div>
                      )}
                      <span>{g.nom}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            {selectedGroup && (
              <div className="modal-section">
                <label>Membres du groupe :</label>
                {modalLoading ? (
                  <div className="modal-loading">Chargement membres...</div>
                ) : groupMembers.length === 0 ? (
                  <div className="modal-empty">Aucun membre</div>
                ) : (
                  <ul>
                    {groupMembers.map(m => (
                      <li key={m.id}>{m.prenom} {m.nom}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {modalError && <div className="modal-error">{modalError}</div>}
            <button
              className="create-conv-btn"
              disabled={!selectedGroup || creating}
              onClick={async () => {
                setCreating(true);
                setModalError(null);
                try {
                  const response = await api.post(`/api/messagerie/conversations?groupeId=${selectedGroup.id}&enseignantId=${enseignantId}`);
                  // Sélectionner automatiquement la nouvelle conversation
                  if (response && response.data && typeof onSelect === 'function') {
                    onSelect(response.data);
                  }
                  setShowNewConv(false);
                  setSelectedGroup(null);
                  setGroupSearch('');
                  setModalError(null);
                  // Recharger les conversations
                  setLoading(true);
                  api.get(`/api/messagerie/conversations/enseignant/${enseignantId}`)
                    .then(data => {
                      groupService.getGroups().then(allGroups => {
                        const enhancedConversations = data.map(conv => ({
                          ...conv,
                          group: allGroups.find(g => g.id === conv.groupeId) || { nom: `Groupe ${conv.groupeId}` },
                          lastActive: conv.dateDernierMessage || new Date().toISOString(),
                          unread: Math.random() > 0.5,
                          online: Math.random() > 0.7,
                        }));
                        setConversations(enhancedConversations);
                      });
                    })
                    .catch(() => setError("Erreur de chargement"))
                    .finally(() => setLoading(false));
                } catch (err) {
                  setModalError('Erreur création conversation');
                }
                setCreating(false);
              }}
            >{creating ? 'Création...' : 'Créer la conversation'}</button>
          </div>
        </div>
      )}

      <div className="conversations-scroll">
        {loading ? (
          <div className="loading-conversations">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="conversation-skeleton">
                <div className="avatar-skeleton"></div>
                <div className="content-skeleton">
                  <div className="line-skeleton"></div>
                  <div className="line-skeleton short"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" 
                  stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>Aucune conversation trouvée</p>
            {search && <button onClick={() => setSearch('')}>Effacer la recherche</button>}
          </div>
        ) : (
          filteredConversations.map(conv => {
            const isSelected = selectedId === conv.id;
            const lastMessageTime = formatTime(conv.lastActive);
            
            return (
              <div
                key={conv.id}
                className={`conversation-item ${isSelected ? 'selected' : ''} ${conv.unread ? 'unread' : ''}`}
                onClick={() => onSelect(conv)}
              >
                <div className="conversation-avatar">
                  <div className="avatar">
                    {conv.group.nom.charAt(0)}
                  </div>
                  <div className="avatar-status">
                    {conv.online && <span className="online-dot"></span>}
                  </div>
                </div>
                
                <div className="conversation-content">
                  <div className="conversation-header">
                    <div className="conversation-title">
                      <h4>{conv.group.nom}</h4>
                      {conv.unread && <span className="unread-badge">{conv.unreadCount || 1}</span>}
                    </div>
                    <div className="conversation-time">
                      {lastMessageTime}
                    </div>
                  </div>
                  
                  <div className="conversation-preview">
                    <p className={`preview-text ${conv.unread ? 'unread' : ''}`}>
                      {conv.dernierMessage ? truncateText(conv.dernierMessage) : 'Aucun message'}
                    </p>
                    {conv.unread && <span className="preview-indicator"></span>}
                  </div>
                  
                  <div className="conversation-meta">
                    <span className="member-count">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" 
                          stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" 
                          stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" 
                          stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" 
                          stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {conv.group.membres} membres
                    </span>
                    {conv.active && (
                      <span className="active-label">Actif</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;