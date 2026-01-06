import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';

const ConversationList = ({ onSelect, selectedId }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const enseignantId = user?.id;

  useEffect(() => {
    if (!enseignantId) return;
    fetch(`/api/messagerie/conversations/enseignant/${enseignantId}`)
      .then(res => res.json())
      .then(data => setConversations(data));
  }, [enseignantId]);

  // Fonction pour démarrer ou ouvrir une conversation avec un groupe
  const handleSelectGroup = async (group) => {
    setError(null);
    let conv = conversations.find(c => c.groupeId === group.id);
    if (!conv) {
      try {
        const res = await fetch('/api/messagerie/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupeId: group.id, enseignantId })
        });
        if (!res.ok) throw new Error();
        conv = await res.json();
        setConversations(prev => [...prev, conv]);
      } catch {
        setError("Impossible de créer la conversation. Veuillez réessayer.");
        return;
      }
    }
    onSelect(conv);
  };

  return (
    <div className="conversation-list" style={{ width: 300, borderRight: '1px solid #eee', overflowY: 'auto' }}>
      <h3>Groupes</h3>
      {error && <div style={{ color: 'red', margin: 8 }}>{error}</div>}
      {loading ? <div>Chargement...</div> : (
        groups.length === 0 ? (
          <div style={{ color: '#888', padding: 16, textAlign: 'center' }}>Aucun groupe disponible.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {groups.map(group => {
              const conv = conversations.find(c => c.groupeId === group.id);
              const isUnread = conv?.unread;
              return (
                <li
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  style={{
                    background: selectedId === conv?.id ? '#f0f0f0' : 'transparent',
                    cursor: 'pointer',
                    padding: '10px 8px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: isUnread ? 'bold' : 'normal',
                    color: isUnread ? '#1976d2' : 'inherit'
                  }}
                >
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <b>{group.nom || group.id}</b>
                    {/* Indicateur de présence en ligne */}
                    {conv?.online && (
                      <span
                        title="Présence en ligne"
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#4caf50',
                          marginLeft: 6,
                          border: '1px solid #fff',
                          boxShadow: '0 0 2px #333',
                        }}
                      />
                    )}
                    {isUnread && <span style={{ marginLeft: 6, color: '#1976d2', fontSize: 11 }} title="Nouveaux messages">•</span>}
                  </div>
                  <div style={{ fontSize: 12, color: isUnread ? '#1976d2' : '#888' }}>{conv?.dernierMessage || ''}</div>
                  <div style={{ fontSize: 11, color: '#bbb' }}>{conv?.dateDernierMessage || ''}</div>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
};

export default ConversationList;
