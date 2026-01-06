import React from "react";
import "./Header.css";
import logoE from "../../logoE.png";

// Header vertical pour la sidebar (logo, utilisateur, logout)

const Header = ({ user }) => {
  // Utiliser la photo de profil renvoyée par le backend
  const photoUrl = user?.urlPhotoProfil;
  const role = user?.role || '';
  const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ');
  return (
    <div className="sidebar-header">
      <div className="logo">
        <img src={logoE} alt="EduProject Logo" />
        <span>EduProject</span>
      </div>
      <div className="user-info">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Photo de profil"
            className="sidebar-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
        ) : (
          <span className="sidebar-avatar sidebar-avatar-icon">
            <i className="fas fa-user" />
          </span>
        )}
        {fullName && <span className="user-name">{fullName}</span>}
        {role && <span className="user-role">{role}</span>}
      </div>
    </div>
  );
};

export default Header;