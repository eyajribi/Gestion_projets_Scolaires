import React from 'react';
import { useAuth } from '../context/AuthContext';

const StudentAppPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="student-app-page">
      <div className="app-download-card">
        <div className="app-icon">
          <i className="fas fa-mobile-alt"></i>
        </div>
        <h1>EduProject Mobile</h1>
        <p>Accédez à vos projets où que vous soyez avec notre application mobile dédiée aux étudiants.</p>
        
        <div className="download-buttons">
          <a href="#" className="download-btn">
            <i className="fab fa-google-play store-icon"></i>
            <div className="store-text">
              <div className="store-name">Disponible sur</div>
              <div className="store-platform">Google Play</div>
            </div>
          </a>
        </div>

        <div className="qr-code">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eduproject.tn/app" alt="QR Code" style={{borderRadius: '8px'}} />
          <p style={{color: 'black', marginTop: '0.5rem', fontSize: '0.8rem'}}>Scannez pour télécharger</p>
        </div>

        <div className="features-list">
          <h3>Fonctionnalités de l'application :</h3>
          <ul style={{textAlign: 'left', margin: '1rem 0', color: 'var(--gray-light)'}}>
            <li><i className="fas fa-check" style={{color: 'var(--accent)', marginRight: '0.5rem'}}></i> Consulter vos projets en temps réel</li>
            <li><i className="fas fa-check" style={{color: 'var(--accent)', marginRight: '0.5rem'}}></i> Soumettre vos livrables</li>
            <li><i className="fas fa-check" style={{color: 'var(--accent)', marginRight: '0.5rem'}}></i> Recevoir des notifications</li>
            <li><i className="fas fa-check" style={{color: 'var(--accent)', marginRight: '0.5rem'}}></i> Communiquer avec votre équipe</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentAppPage;