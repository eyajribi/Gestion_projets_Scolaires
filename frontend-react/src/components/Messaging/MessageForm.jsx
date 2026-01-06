import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './messaging.css';

const MessageForm = ({ conversationId, onSend, isTyping }) => {
  const [contenu, setContenu] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  
  const emojis = ['😀', '😊', '😂', '🤔', '👍', '❤️', '🎉', '📚', '✏️', '✅'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contenu.trim()) return;
    
    setSending(true);
    try {
      const params = new URLSearchParams({
        conversationId,
        expediteurId: user?.id,
        expediteurNom: user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : '',
        contenu
      });
      const res = await fetch('/api/messagerie/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      if (res.ok) {
        const saved = await res.json();
        onSend(saved);
        setContenu('');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simuler l'upload
      setSending(true);
      setTimeout(() => {
        const fileMessage = {
          id: Date.now(),
          conversationId,
          expediteurNom: user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : '',
          contenu: `📎 ${file.name}`,
          dateEnvoi: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          lu: false,
          isCurrentUser: true,
          type: 'file',
          fileSize: `${(file.size / 1024).toFixed(1)} KB`
        };
        onSend(fileMessage);
        setSending(false);
      }, 1000);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setContenu(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-form-container">
      {isTyping && (
        <div className="typing-notification">
          <span>{conversationId ? 'Quelqu\'un' : 'Membre'} est en train d'écrire...</span>
        </div>
      )}
      
      <div className="attachment-menu" style={{ display: showAttachments ? 'flex' : 'none' }}>
        <div className="attachment-options">
          <button className="attachment-option" onClick={() => fileInputRef.current.click()}>
            <div className="option-icon">📎</div>
            <span>Document</span>
          </button>
          <button className="attachment-option">
            <div className="option-icon">🖼️</div>
            <span>Image</span>
          </button>
          <button className="attachment-option">
            <div className="option-icon">📷</div>
            <span>Caméra</span>
          </button>
          <button className="attachment-option">
            <div className="option-icon">📂</div>
            <span>Fichier</span>
          </button>
        </div>
      </div>

      <div className="emoji-picker" style={{ display: showEmoji ? 'grid' : 'none' }}>
        {emojis.map((emoji, index) => (
          <button
            key={index}
            className="emoji-btn"
            onClick={() => handleEmojiSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        
        <div className="form-actions">
          <button
            type="button"
            className="action-btn"
            onClick={() => {
              setShowAttachments(!showAttachments);
              setShowEmoji(false);
            }}
            title="Joindre un fichier"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.00505 21.9983C6.41286 21.9983 4.88589 21.3658 3.76005 20.24C2.6342 19.1142 2.00171 17.5872 2.00171 15.995C2.00171 14.4028 2.6342 12.8759 3.76005 11.75L12.33 3.18C13.0875 2.4225 14.1336 2.00262 15.225 2.00262C16.3165 2.00262 17.3625 2.4225 18.12 3.18C18.8775 3.9375 19.2974 4.9836 19.2974 6.075C19.2974 7.1664 18.8775 8.2125 18.12 8.97L9.55005 17.54C9.18086 17.9092 8.65494 18.1238 8.10505 18.1238C7.55515 18.1238 7.02924 17.9092 6.66005 17.54C6.29086 17.1708 6.07621 16.6449 6.07621 16.095C6.07621 15.5451 6.29086 15.0192 6.66005 14.65L15.07 6.23" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button
            type="button"
            className="action-btn"
            onClick={() => {
              setShowEmoji(!showEmoji);
              setShowAttachments(false);
            }}
            title="Insérer un emoji"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9H9.01" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 9H15.01" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="message-input-container">
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            rows="1"
            disabled={sending}
          />
          <div className="input-actions">
            {contenu.length > 0 && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setContenu('')}
                title="Effacer"
              >
                ×
              </button>
            )}
            <span className="char-count">{contenu.length}/1000</span>
          </div>
        </div>

        <button
          type="submit"
          className={`send-btn ${!contenu.trim() ? 'disabled' : ''}`}
          disabled={sending || !contenu.trim()}
        >
          {sending ? (
            <div className="spinner"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageForm;