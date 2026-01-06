import React, { useState } from 'react';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
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
          <div className="header-left">
            <h1>Messages</h1>
            <div className="online-indicator">
              <span className="dot"></span>
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
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" 
                      stroke="#4A5568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2>Votre messagerie</h2>
                <p>Sélectionnez une conversation pour commencer à discuter</p>
                <div className="welcome-features">
                  <div className="feature">
                    <span className="feature-icon">🔒</span>
                    <span>Messages chiffrés de bout en bout</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🚀</span>
                    <span>Notifications en temps réel</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">📎</span>
                    <span>Partage de fichiers</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Footer />
      </main>
    </div>
  );
};

export default MessagingPage;