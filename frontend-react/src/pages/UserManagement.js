import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
    const [showEdit, setShowEdit] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(7);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ nom: "", prenom: "", email: "", role: "ETUDIANT" });
  const { user, logout } = useAuth();

  useEffect(() => {
    setLoading(true);
    api.get('/api/admin/utilisateurs')
      .then(res => {
        // Supporte res.data ou res directement selon le format API
        if (Array.isArray(res)) {
          setUsers(res);
        } else if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          setUsers([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setUsers([]);
        setLoading(false);
      });
  }, []);

  // Recherche filtrée
  const filteredUsers = users.filter(u =>
    (u.nom + " " + u.prenom + " " + u.email + " " + (u.role || "")).toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Création utilisateur
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/admin/utilisateurs', newUser);
      setUsers([...users, res.data || res]);
      setShowCreate(false);
      setNewUser({ nom: "", prenom: "", email: "", role: "ETUDIANT" });
    } catch {
      // Erreur création
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setShowEdit(true);
  };

  const handleDelete = async (id) => {
    setDeleteUserId(id);
    setShowDelete(true);
  };

  // ...add create/update logic as needed

  return (
    <div className="modern-admin-wrapper">
      <Sidebar user={user} onLogout={logout} activeView="admin-users" onNavigate={(view) => {
        if (view === 'admin-dashboard') window.location.href = '/admin/dashboard';
        if (view === 'admin-users') window.location.href = '/admin/users';
      }} />
      <div className="user-management modern-user-management">
        <div className="user-header">
          <h1><i className="fas fa-users"></i> Gestion des Utilisateurs</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
            />
            <button className="btn-modern btn-add-user" onClick={() => setShowCreate(true)}>
              <i className="fas fa-user-plus"></i> Ajouter un utilisateur
            </button>
          </div>
        </div>
        {showCreate && (
          <div className="create-user-modal">
            <form className="create-user-form" onSubmit={handleCreateUser}>
              <h2>Créer un utilisateur</h2>
              <div className="form-row">
                <input type="text" placeholder="Nom" value={newUser.nom} onChange={e => setNewUser({ ...newUser, nom: e.target.value })} required />
                <input type="text" placeholder="Prénom" value={newUser.prenom} onChange={e => setNewUser({ ...newUser, prenom: e.target.value })} required />
              </div>
              <div className="form-row">
                <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="ETUDIANT">Etudiant</option>
                  <option value="ENSEIGNANT">Enseignant</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-modern btn-add-user">Créer</button>
                <button type="button" className="btn-modern btn-delete" onClick={() => setShowCreate(false)}>Annuler</button>
              </div>
            </form>
          </div>
        )}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des utilisateurs...</p>
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="empty-state modern-empty">
                <i className="fas fa-user-slash empty-icon"></i>
                <p>Aucun utilisateur trouvé.</p>
              </div>
            ) : (
              <div className="table-responsive modern-table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map(user => (
                      <tr key={user.id} className="modern-row">
                        <td>
                          <div className="user-avatar">
                            <i className="fas fa-user-circle"></i>
                          </div>
                        </td>
                        <td>{user.nom}</td>
                        <td>{user.prenom}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${(Array.isArray(user.roles) ? user.roles[0] : user.role)?.toLowerCase()}`}>
                            {(() => {
                              const role = Array.isArray(user.roles) ? user.roles[0] : user.role;
                              if (!role) return '';
                              if (role.includes('ENSEIGNANT')) return 'Enseignant';
                              if (role.includes('ETUDIANT')) return 'Etudiant';
                              if (role.includes('ADMIN')) return 'Admin';
                              return role;
                            })()}
                          </span>
                        </td>
                        <td>
                          <button className="btn-modern btn-edit" onClick={() => handleEdit(user)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn-modern btn-delete"
                            onClick={() => handleDelete(user.id)}
                            disabled={user.role?.toLowerCase() === 'admin'}
                            title={user.role?.toLowerCase() === 'admin' ? "Impossible de supprimer l'administrateur" : "Supprimer"}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                              {/* Modal édition utilisateur */}
                              {showEdit && editUser && (
                                <div className="create-user-modal">
                                  <form className="create-user-form" onSubmit={async (e) => {
                                    e.preventDefault();
                                    setLoading(true);
                                    try {
                                      const res = await api.put(`/api/admin/utilisateurs/${editUser.id}`, editUser);
                                      setUsers(users.map(u => u.id === editUser.id ? (res.data || res) : u));
                                      setShowEdit(false);
                                      setEditUser(null);
                                    } catch {}
                                    setLoading(false);
                                  }}>
                                    <h2>Modifier utilisateur</h2>
                                    <div className="form-row">
                                      <input type="text" placeholder="Nom" value={editUser.nom} onChange={e => setEditUser({ ...editUser, nom: e.target.value })} required />
                                      <input type="text" placeholder="Prénom" value={editUser.prenom} onChange={e => setEditUser({ ...editUser, prenom: e.target.value })} required />
                                    </div>
                                    <div className="form-row">
                                      <input type="email" placeholder="Email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} required />
                                      <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                                        <option value="ETUDIANT">Etudiant</option>
                                        <option value="ENSEIGNANT">Enseignant</option>
                                      </select>
                                    </div>
                                    <div className="form-actions">
                                      <button type="submit" className="btn-modern btn-edit">Enregistrer</button>
                                      <button type="button" className="btn-modern btn-delete" onClick={() => { setShowEdit(false); setEditUser(null); }}>Annuler</button>
                                    </div>
                                  </form>
                                </div>
                              )}
                              {/* Modal confirmation suppression */}
                              {showDelete && (
                                <div className="create-user-modal">
                                  <div className="create-user-form">
                                    <h2>Confirmer la suppression</h2>
                                    <p>Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.</p>
                                    <div className="form-actions">
                                      <button
                                        className="btn-modern btn-delete"
                                        onClick={async () => {
                                          setLoading(true);
                                          await api.delete(`/api/admin/utilisateurs/${deleteUserId}`);
                                          setUsers(users.filter(u => u.id !== deleteUserId));
                                          setShowDelete(false);
                                          setDeleteUserId(null);
                                          setLoading(false);
                                        }}
                                      >Supprimer</button>
                                      <button className="btn-modern btn-edit" onClick={() => { setShowDelete(false); setDeleteUserId(null); }}>Annuler</button>
                                    </div>
                                  </div>
                                </div>
                              )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination-bar">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`btn-modern btn-page${currentPage === i + 1 ? ' active' : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
