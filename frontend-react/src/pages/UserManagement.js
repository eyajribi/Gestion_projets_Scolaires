import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    api.get('/admin/utilisateurs').then(res => setUsers(res.data));
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    await api.delete(`/admin/utilisateurs/${id}`);
    setUsers(users.filter(u => u.id !== id));
  };

  // ...add create/update logic as needed

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar user={user} onLogout={logout} activeView="admin-users" onNavigate={(view) => {
        if (view === 'admin-dashboard') window.location.href = '/admin/dashboard';
        if (view === 'admin-users') window.location.href = '/admin/users';
      }} />
      <div className="user-management" style={{ flex: 1 }}>
        <h1>Gestion des Utilisateurs</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nom}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleEdit(user)}>Modifier</button>
                  <button onClick={() => handleDelete(user.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Add user creation and edit forms here */}
      </div>
    </div>
  );
};

export default UserManagement;
