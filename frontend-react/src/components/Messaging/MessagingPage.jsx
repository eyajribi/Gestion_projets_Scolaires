import React, { useState } from 'react';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import './messaging.css';
import Sidebar from '../Layout/Sidebar';
import Footer from '../Layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/messaging.css';

const routeMap = {
  dashboard: '/teacher-dashboard',
  projects: '/projects',
  'all-tasks': '/tasks',
  deliverables: '/deliverables',
  groups: '/groups',
  statistics: '/statistics',
  'deadlines-calendar': '/deadlines-calendar',
  profile: '/profile',
  messaging: '/messaging',
};

const MessagingPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (id) => {
    if (routeMap[id]) {
      navigate(routeMap[id]);
    }
  };

  return (
    <div className="messaging-page">
      <Sidebar
        activeView="messaging"
        user={user}
        onNavigate={handleNavigate}
        onLogout={logout}
      />
      
      <main className="messaging-main">
        <header className="messaging-header">
          <div className="header-left" style={{ alignItems: 'center', gap: 24 }}>
            <h1 style={{ fontWeight: 700, fontSize: 28, color: 'var(--primary-color)', margin: 0, letterSpacing: 1 }}>Messages</h1>
            <div className="online-indicator" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--success-color)', borderRadius: 16, padding: '4px 12px', color: '#fff', fontWeight: 500, fontSize: 15 }}>
              <span className="dot" style={{ width: 10, height: 10, background: '#fff', borderRadius: '50%', marginRight: 8, display: 'inline-block', boxShadow: '0 0 4px #333' }}></span>
              <span>En ligne</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" title="Rechercher">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="icon-btn" title="Nouvelle conversation">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="icon-btn" title="Paramètres">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                  stroke="currentColor" strokeWidth="2"/>
                <path d="M19.4 15C19.2667 15.3333 19.1333 15.6667 19 16L21 18C21.6667 18.6667 22 19 22 20C22 21 21 22 20 22C19 22 18.6667 21.6667 18 21L16 19C15.6667 19.1333 15.3333 19.2667 15 19.4" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </header>

        <div className="messaging-container">
          <ConversationList 
            onSelect={setSelectedConversation} 
            selectedId={selectedConversation?.id} 
          />
          <ConversationView 
            conversation={selectedConversation} 
            onBack={() => setSelectedConversation(null)}
          />
          
          {!selectedConversation && (
            <div className="welcome-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="welcome-content" style={{ textAlign: 'center', maxWidth: 480, padding: 32 }}>
                <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 16, color: '#fff' }}>Votre messagerie</h2>
                <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 32 }}>Sélectionnez une conversation pour commencer à discuter</p>
                <div className="welcome-features" style={{ marginTop: 32 }}>
                  <div className="feature" style={{ fontSize: 16, marginBottom: 12 }}>
                    <strong>Messages chiffrés de bout en bout</strong>
                  </div>
                  <div className="feature" style={{ fontSize: 16, marginBottom: 12 }}>
                    <strong>Notifications en temps réel</strong>
                  </div>
                  <div className="feature" style={{ fontSize: 16 }}>
                    <strong>Partage de fichiers</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer retiré pour affichage complet de la messagerie */}
      </main>
    </div>
  );
};

export default MessagingPage;