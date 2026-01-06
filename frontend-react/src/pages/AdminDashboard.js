import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    api.get('/api/admin/dashboard').then(res => setStats(res.data));
    api.get('/api/admin/logs').then(res => {
      // Ensure logs is always an array
      if (Array.isArray(res.data)) setLogs(res.data);
      else if (Array.isArray(res)) setLogs(res);
      else setLogs([]);
    });
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar user={user} onLogout={logout} activeView="admin-dashboard" onNavigate={(view) => {
        if (view === 'admin-dashboard') window.location.href = '/admin/dashboard';
        if (view === 'admin-users') window.location.href = '/admin/users';
      }} />
      <div className="admin-dashboard" style={{ flex: 1 }}>
        <h1>Dashboard Administrateur</h1>
        <section>
          <h2>Statistiques</h2>
          {stats ? (
            Object.keys(stats).length > 0 ? (
              <div className="admin-stats">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key}><strong>{key}:</strong> {value}</div>
                ))}
              </div>
            ) : (
              <p>Aucune statistique disponible</p>
            )
          ) : (
            <p>Chargement des statistiques...</p>
          )}
        </section>
        <section>
          <h2>Logs système</h2>
          {Array.isArray(logs) && logs.length > 0 ? (
            <ul>
              {logs.map((log, idx) => <li key={idx}>{log}</li>)}
            </ul>
          ) : (
            <p>Aucun log disponible</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
