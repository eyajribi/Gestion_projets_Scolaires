import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./Sidebar.css";

const Sidebar = ({ activeView, onNavigate, getTotalTasksCount, getDelayedTasksCount, user, onLogout }) => {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_compact_mode");
    if (saved === "true") {
      setIsCompact(true);
    }
  }, []);

  const toggleCompact = () => {
    setIsCompact((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_compact_mode", String(next));
      return next;
    });
  };

  const mainNavigation = [
    { id: "dashboard", label: "Tableau de bord", icon: "fas fa-tachometer-alt" },
    { id: "projects", label: "Projets", icon: "fas fa-project-diagram" },
    { id: "all-tasks", label: "Tâches", icon: "fas fa-tasks", badge: true },
    { id: "deliverables", label: "Livrables", icon: "fas fa-file-upload" },
    { id: "groups", label: "Groupes", icon: "fas fa-users" },
    { id: "statistics", label: "Statistiques", icon: "fas fa-chart-bar" },
    { id: "deadlines-calendar", label: "Calendrier des échéances", icon: "fas fa-calendar-alt" },
    { id: "messaging", label: "Messagerie", icon: "fas fa-comments" },
  ];

  // Admin navigation links
  const adminNavigation = [
    { id: "admin-dashboard", label: "Admin Dashboard", icon: "fas fa-user-shield" },
    { id: "admin-users", label: "Gestion Utilisateurs", icon: "fas fa-users-cog" },
  ];

  return (
    <aside className={`sidebar${isCompact ? " sidebar--compact" : ""}`}>
      <Header user={user} />
      <div className="sidebar-footer sidebar-footer--top">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={toggleCompact}
          title={isCompact ? "Afficher le texte du menu" : "Afficher seulement les icônes"}
        >
          <i className={isCompact ? "fas fa-ellipsis-h" : "fas fa-chevron-left"}></i>
        </button>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <ul>
            {/* Only show teacher links for non-admin users */}
            {user?.role !== "ADMIN" && mainNavigation.map((item) => (
              <li key={item.id}>
                <button
                  className={`sidebar-link${activeView === item.id ? " active" : ""}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <span className="sidebar-link-indicator" aria-hidden="true" />
                  <i className={item.icon}></i>
                  <span className="sidebar-link-label">{item.label}</span>
                  {item.id === "all-tasks" && getDelayedTasksCount && getDelayedTasksCount() > 0 && (
                    <span className="sidebar-badge danger">{getDelayedTasksCount()}</span>
                  )}
                  {item.id === "all-tasks" && getDelayedTasksCount && getDelayedTasksCount() === 0 && getTotalTasksCount && getTotalTasksCount() > 0 && (
                    <span className="sidebar-badge">{getTotalTasksCount()}</span>
                  )}
                </button>
              </li>
            ))}
            {/* Only show admin links for admin users */}
            {user?.role === "ADMIN" && adminNavigation.map((item) => (
              <li key={item.id}>
                <button
                  className={`sidebar-link${activeView === item.id ? " active" : ""}`}
                  onClick={() => {
                    if (item.id === "admin-dashboard") {
                      window.location.href = "/admin/dashboard";
                    } else if (item.id === "admin-users") {
                      window.location.href = "/admin/users";
                    }
                  }}
                >
                  <span className="sidebar-link-indicator" aria-hidden="true" />
                  <i className={item.icon}></i>
                  <span className="sidebar-link-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-section sidebar-section-account">
          <ul>
            {/* Allow all users, including admin, to access profile */}
            <li>
              <button
                className={`sidebar-link${activeView === "profile" ? " active" : ""}`}
                onClick={() => onNavigate("profile")}
              >
                <span className="sidebar-link-indicator" aria-hidden="true" />
                <i className="fas fa-user"></i>
                <span className="sidebar-link-label">Profil</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="sidebar-link sidebar-link-logout"
                onClick={onLogout}
              >
                <span className="sidebar-link-indicator" aria-hidden="true" />
                <i className="fas fa-sign-out-alt"></i>
                <span className="sidebar-link-label">Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
