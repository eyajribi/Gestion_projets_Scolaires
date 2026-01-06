import React, { useEffect, useRef, useState } from 'react';
import MessageForm from './MessageForm';

const ConversationView = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fonction pour charger les messages
  const fetchMessages = () => {
    if (!conversation) return;
    setLoading(true);
    setError(null);
    fetch(`/api/messagerie/messages/${conversation.id}`)
      .then(async res => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          setError('Erreur lors de la récupération des messages. Le serveur a retourné une réponse inattendue.');
          setMessages([]);
          return null;
        }
      })
      .then(data => {
        if (data) setMessages(data);
      })
      .catch(() => {
        setError('Erreur réseau lors de la récupération des messages.');
        setMessages([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
    // Rafraîchissement automatique toutes les 5 secondes
    if (!conversation) return;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return <div className="conversation-view" style={{ flex: 1, padding: 20 }}>Sélectionnez une conversation</div>;
  }

  return (
    <div className="conversation-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 10, borderBottom: '1px solid #eee' }}>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        {loading ? <div>Chargement...</div> : (
          messages.map(msg => (
            <div key={msg.id} style={{ marginBottom: 12, background: msg.lu ? '#fff' : '#e6f7ff', padding: 8, borderRadius: 6 }}>
              <div style={{ fontWeight: 'bold', fontSize: 13 }}>{msg.expediteurNom}</div>
              <div>{msg.contenu}</div>
              <div style={{ fontSize: 11, color: '#888', textAlign: 'right' }}>{msg.dateEnvoi}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageForm conversationId={conversation.id} onSend={msg => setMessages(m => [...m, msg])} />
    </div>
  );
};

export default ConversationView;
