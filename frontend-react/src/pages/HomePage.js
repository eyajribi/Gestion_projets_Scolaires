import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from "../components/UI/LoadingSpinner";
import logoE from "../logoE.png";
import Toast from "../components/UI/Toast";

const Login = React.lazy(() => import("../components/Auth/Login"));
const Register = React.lazy(() => import("../components/Auth/Register"));

// Composant pour les onglets d'authentification
function AuthTabs() {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  const handleSwitchToForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="auth-tabs">
      <div className="tab-navigation compact">
        <button
          className={`tab ${activeTab === "login" ? "active" : ""}`}
          onClick={() => setActiveTab("login")}
          aria-selected={activeTab === "login"}
          aria-controls="login-panel"
          id="login-tab"
        >
          <i className="fas fa-sign-in-alt"></i>
          Connexion
        </button>
        <button
          className={`tab ${activeTab === "register" ? "active" : ""}`}
          onClick={() => setActiveTab("register")}
          aria-selected={activeTab === "register"}
          aria-controls="register-panel"
          id="register-tab"
        >
          <i className="fas fa-user-plus"></i>
          Inscription
        </button>
      </div>

      <div className="tab-content compact">
        <div
          id="login-panel"
          role="tabpanel"
          hidden={activeTab !== "login"}
          aria-labelledby="login-tab"
        >
          {activeTab === "login" && (
            <React.Suspense fallback={<LoadingSpinner />}>
              <Login 
                onSwitchToRegister={() => setActiveTab("register")}
                onSwitchToForgotPassword={handleSwitchToForgotPassword}
                compact={true}
              />
            </React.Suspense>
          )}
        </div>
        <div
          id="register-panel"
          role="tabpanel"
          hidden={activeTab !== "register"}
          aria-labelledby="register-tab"
        >
          {activeTab === "register" && (
            <React.Suspense fallback={<LoadingSpinner />}>
              <Register onSwitchToLogin={() => setActiveTab("login")} compact={true} />
            </React.Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant pour la page d'accueil
function HomePage() {
  const [showDemo, setShowDemo] = useState(false);
  const [showStartToast, setShowStartToast] = useState(false);

  const handleOpenDemo = (e) => {
    e.preventDefault();
    setShowDemo(true);
  };

  const handleCloseDemo = () => {
    setShowDemo(false);
  };

  const handleStartClick = () => {
    const authSection = document.getElementById("auth-section");
    if (authSection) authSection.scrollIntoView({ behavior: "smooth" });

    // Placer le curseur directement dans le champ email du login
    setTimeout(() => {
      const input = document.getElementById("login-email");
      if (input) input.focus();
    }, 400);

    // Afficher un toast personnalisé
    setShowStartToast(true);
  };

  return (
    <div id="login-page" className="login-container" role="main">
      {/* Floating background elements */}
      <div className="floating-element" aria-hidden="true"></div>
      <div className="floating-element" aria-hidden="true"></div>
      <div className="floating-element" aria-hidden="true"></div>
      <div className="floating-element" aria-hidden="true"></div>

      <div className="login-left">
        <div className="sidebar-header" style={{boxShadow: 'none', borderBottom: 'none', background: 'transparent', minHeight: 'auto', padding: 0, marginBottom: '1.75rem'}}>
          <div className="logo login-logo">
            <img src={logoE} alt="EduProject Logo" />
            <span>EduProject</span>
          </div>
        </div>

        <div className="home-hero-header">
          <div className="home-hero-badge" aria-label="Plateforme dédiée aux projets scolaires pour enseignants">
            <span className="home-hero-badge-dot" aria-hidden="true"></span>
            Nouveau • Plateforme de gestion des projets scolaires pour enseignants
          </div>
          <h1 className="compact-title">
            Supervisez vos projets étudiants
            <span className="home-hero-title-accent"> sans stress.</span>
          </h1>
          <p className="compact-text">
            EduProject aide les enseignants à structurer, suivre et évaluer les projets
            de leurs étudiants : groupes, tâches, livrables et notes sont centralisés
            dans une seule plateforme, du lancement à la soutenance finale.
          </p>
        </div>

        <div className="home-cta-group">
          <button
            type="button"
            className="btn home-cta-primary"
            onClick={handleStartClick}
          >
            <i className="fas fa-rocket" aria-hidden="true"></i>
            Commencer maintenant
          </button>
          <button
            type="button"
            className="btn btn-outline home-cta-secondary"
            onClick={handleOpenDemo}
          >
            <i className="fas fa-eye" aria-hidden="true"></i>
            Voir la démo rapide
          </button>
        </div>

        <div className="home-meta">
          <span>
            <i className="fas fa-shield-alt" aria-hidden="true"></i>
            Accès sécurisé pour enseignants
          </span>
          <span>
            <i className="fas fa-clock" aria-hidden="true"></i>
            Mise en place en quelques minutes
          </span>
        </div>

        <div className="home-highlight-card card" aria-label="Principales fonctionnalités pour les enseignants">
          <h2 className="compact-subtitle">Tout ce dont un enseignant a besoin</h2>
          <ul className="features-list compact" role="list">
            <li>
              <i className="fas fa-project-diagram" aria-hidden="true"></i>
              Création et suivi des projets avec jalons pédagogiques clés
            </li>
            <li>
              <i className="fas fa-tasks" aria-hidden="true"></i>
              Gestion des tâches et des responsabilités par groupe d'étudiants
            </li>
            <li>
              <i className="fas fa-file-alt" aria-hidden="true"></i>
              Dépôt et évaluation des livrables en ligne
            </li>
            <li>
              <i className="fas fa-comments" aria-hidden="true"></i>
              Communication centralisée entre encadrants et étudiants
            </li>
          </ul>
        </div>

        <div className="home-mobile-card card" aria-label="Application mobile pour vos étudiants">
          <div className="home-mobile-header">
            <div className="home-mobile-icon">
              <i className="fas fa-mobile-alt" aria-hidden="true"></i>
            </div>
            <div>
              <h2 className="compact-subtitle">EduProject Mobile – pour vos étudiants</h2>
              <p className="compact-text">
                Offrez à vos étudiants une application mobile connectée à votre espace web
                enseignant : ils suivent leur projet et déposent leurs livrables en toute autonomie.
              </p>
            </div>
          </div>

          <ul className="features-list compact" role="list">
            <li>
              <i className="fas fa-check" aria-hidden="true"></i>
              Consultation des projets en temps réel par les étudiants
            </li>
            <li>
              <i className="fas fa-check" aria-hidden="true"></i>
              Dépôt des livrables directement depuis le mobile
            </li>
            <li>
              <i className="fas fa-check" aria-hidden="true"></i>
              Notifications sur les échéances importantes de vos projets
            </li>
            <li>
              <i className="fas fa-check" aria-hidden="true"></i>
              Espace de communication pour les membres de chaque groupe
            </li>
          </ul>
        </div>
      </div>

      <div className="login-right compact" id="auth-section">
        <AuthTabs />
      </div>

      {showDemo && (
        <div className="home-demo-overlay" role="dialog" aria-modal="true" aria-labelledby="home-demo-title">
          <div className="home-demo-modal">
            <button className="home-demo-close" type="button" onClick={handleCloseDemo} aria-label="Fermer la démo">
              <i className="fas fa-times"></i>
            </button>
            <h2 id="home-demo-title">Découvrez EduProject côté enseignant</h2>
            <p className="home-demo-text">
              Voici un aperçu rapide de la plateforme web EduProject utilisée par les
              enseignants pour organiser, suivre et évaluer les projets scolaires.
            </p>

            <ol className="home-demo-steps">
              <li>
                <strong>1. Créez vos projets :</strong> définissez le sujet, les livrables attendus
                et les dates clés directement depuis l'interface web.
              </li>
              <li>
                <strong>2. Organisez les groupes :</strong> assignez les étudiants, répartissez les tâches
                et visualisez l'avancement de chaque équipe en temps réel.
              </li>
              <li>
                <strong>3. Évaluez les livrables :</strong> consultez les dépôts, laissez des commentaires
                et validez les projets depuis un tableau de bord unique.
              </li>
            </ol>

            <div className="home-demo-footer">
              <span>
                <i className="fas fa-desktop" aria-hidden="true"></i>
                Une application web pensée pour le quotidien des enseignants.
              </span>
              <button type="button" className="btn" onClick={handleCloseDemo}>
                J'ai compris, fermer la démo
              </button>
            </div>
          </div>
        </div>
      )}

      {showStartToast && (
        <Toast
          message="Commencez par saisir votre email pour vous connecter à EduProject."
          type="info"
          duration={3500}
          onClose={() => setShowStartToast(false)}
        />
      )}
    </div>
  );
}

export default HomePage;