import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const MessageForm = ({ conversationId, onSend }) => {
  const [contenu, setContenu] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const expediteurId = user?.id;
  const expediteurNom = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contenu.trim() || !expediteurId) return;
    setSending(true);
    const message = {
      conversationId,
      expediteurId,
      expediteurNom,
      contenu,
      dateEnvoi: new Date().toISOString(),
      lu: false
    };
    try {
      const res = await fetch('/api/messagerie/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      if (res.ok) {
        const saved = await res.json();
        onSend(saved);
        setContenu('');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', padding: 10 }}>
      <input
        type="text"
        value={contenu}
        onChange={e => setContenu(e.target.value)}
        placeholder="Votre message..."
        style={{ flex: 1, marginRight: 8 }}
        disabled={sending}
      />
      <button type="submit" disabled={sending || !contenu.trim()}>
        {sending ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  );
};

export default MessageForm;
