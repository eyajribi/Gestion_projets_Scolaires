import React, { useEffect, useRef, useState } from 'react';
import MessageForm from './MessageForm';
import './messaging.css';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ConversationView = ({ conversation, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Simuler quelques messages pour le design
  const mockMessages = [
    {
      id: 1,
      contenu: "Bonjour, avez-vous des questions sur le projet ?",
      expediteurNom: "Professeur Dupont",
      dateEnvoi: "10:30",
      lu: true,
      isCurrentUser: false
    },
    {
      id: 2,
      contenu: "Oui, concernant la date limite de rendu",
      expediteurNom: "Étudiant A",
      dateEnvoi: "10:32",
      lu: true,
      isCurrentUser: false
    },
    {
      id: 3,
      contenu: "Vous avez jusqu'au vendredi 17h pour le rendre",
      expediteurNom: user ? `${user.prenom} ${user.nom}` : "Vous",
      dateEnvoi: "10:35",
      lu: true,
      isCurrentUser: true
    },
    {
      id: 4,
      contenu: "Parfait, merci beaucoup !",
      expediteurNom: "Étudiant B",
      dateEnvoi: "10:36",
      lu: false,
      isCurrentUser: false
    }
  ];

  useEffect(() => {
    if (conversation) {
      setLoading(true);
      setError(null);
      api.get(`/api/messagerie/messages/${conversation.id}`)
        .then(data => {
          setMessages(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });

      // Simuler quelqu'un qui tape
      const typingInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }
      }, 10000);
      return () => clearInterval(typingInterval);
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (newMessage) => {
    const messageWithUser = {
      ...newMessage,
      isCurrentUser: true,
      dateEnvoi: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, messageWithUser]);
  };

  if (!conversation) {
    return null;
  }

  return (
    <div className="conversation-view">
      <div className="conversation-header">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="conversation-info">
          <div className="info-avatar">
            <div className="avatar-large">
              {conversation.group.nom.charAt(0)}
            </div>
            <div className="avatar-status">
              {conversation.online && <span className="online-dot large"></span>}
            </div>
          </div>
          <div className="info-details">
            <h3>{conversation.group.nom}</h3>
            <div className="info-status">
              {conversation.online ? (
                <span className="status-online">En ligne</span>
              ) : (
                <span className="status-offline">
                  Dernière connexion: {conversation.lastActive ? 
                    new Date(conversation.lastActive).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 
                    'Inconnue'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="icon-btn" title="Appel vocal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92C22 18.07 21.07 19 19.93 19C19.07 19 18.27 18.55 17.86 17.82C17.44 17.08 16.9 16.34 16.26 15.7C15.62 15.06 14.88 14.52 14.14 14.1C13.41 13.69 12.96 12.89 12.96 12.03C12.96 10.9 13.89 9.97 15.04 9.97H15.05C15.74 9.97 16.39 10.29 16.82 10.82L18.19 12.5C19.25 11.84 20 10.71 20 9.5C20 7.57 18.43 6 16.5 6H16.49C15.1 6 13.86 6.8 13.27 8H13.26C12.6 7.45 11.75 7.12 10.85 7.03C10.4 4.97 8.57 3.5 6.5 3.5C4.01 3.5 2 5.51 2 8C2 9.82 3.13 11.36 4.7 12C4.26 12.9 4 13.91 4 15C4 18.31 6.69 21 10 21C12.06 21 13.89 20 15 18.5" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="icon-btn" title="Appel vidéo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H14C15.1046 19 16 18.1046 16 17V7C16 5.89543 15.1046 5 14 5Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="icon-btn" title="Informations">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-scroll">
          {loading ? (
            <div className="loading-messages">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="message-skeleton">
                  <div className="avatar-skeleton small"></div>
                  <div className="message-content-skeleton">
                    <div className="line-skeleton"></div>
                    <div className="line-skeleton short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-messages">
              <p>{error}</p>
              <button onClick={() => {
                setError(null);
                setLoading(true);
                api.get(`/api/messagerie/messages/${conversation.id}`)
                  .then(data => {
                    setMessages(data);
                    setLoading(false);
                  })
                  .catch(err => {
                    setError(err.message);
                    setLoading(false);
                  });
              }}>Réessayer</button>
            </div>
          ) : (
            <>
              <div className="date-separator">
                <span>Aujourd'hui</span>
              </div>
              
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.isCurrentUser ? 'sent' : 'received'}`}>
                  {!msg.isCurrentUser && (
                    <div className="message-avatar">
                      <div className="avatar-small">
                        {msg.expediteurNom.charAt(0)}
                      </div>
                    </div>
                  )}
                  
                  <div className="message-content">
                    {!msg.isCurrentUser && (
                      <div className="message-sender">{msg.expediteurNom}</div>
                    )}
                    <div className={`message-bubble ${msg.isCurrentUser ? 'sent' : 'received'}`}>
                      <p>{msg.contenu}</p>
                      <div className="message-meta">
                        <span className="message-time">{msg.dateEnvoi}</span>
                        {msg.isCurrentUser && (
                          <span className="message-status">
                            {msg.lu ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M8 12L11 15L16 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                                  stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                                  stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="typing-indicator">
                  <div className="message-avatar">
                    <div className="avatar-small">
                      {conversation.group.nom.charAt(0)}
                    </div>
                  </div>
                  <div className="typing-bubble">
                    <div className="typing-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    <span>tape...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      <MessageForm 
        conversationId={conversation.id} 
        onSend={handleSendMessage}
        isTyping={isTyping}
      />
    </div>
  );
};

export default ConversationView;