import React, { useState, useEffect } from 'react';
import './ProfileForm.css';

const ProfileForm = ({ user, onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    numTel: '',
    nomFac: '',
    nomDep: '',
    specialite: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        numTel: user.numTel || user.telephone || '',
        nomFac: user.nomFac || user.institution || '',
        nomDep: Array.isArray(user.nomDep)
          ? user.nomDep.join(', ')
          : user.nomDep || '',
        specialite: user.specialite || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  // Options académiques alignées sur le formulaire d'inscription
  const institutions = [
    "ISET de Radès",
    "ISET de Nabeul",
    "ISET de Bizerte",
    "ISET de Kairouan",
    "ISET de Sousse",
    "Autre",
  ];

  const specialitesParInstitution = {
    "ISET de Radès": ["Informatique", "Électronique", "Mécanique", "Gestion", "Commerce"],
    "ISET de Nabeul": ["Informatique", "Électronique", "Mécanique", "Textile"],
    "ISET de Bizerte": ["Informatique", "Électronique", "Mécanique"],
    "ISET de Kairouan": ["Informatique", "Électronique", "Mécanique"],
    "ISET de Sousse": ["Informatique", "Électronique", "Mécanique"],
    Autre: [],
  };

  const currentSpecialites = specialitesParInstitution[formData.nomFac] || [];

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="profile-form-header">
        <h2>Informations de profil</h2>
        <p>
          Mettez à jour vos coordonnées académiques et de contact
          pour garder votre compte à jour.
        </p>
      </div>

      <section className="profile-section">
        <h3 className="section-title">Informations personnelles</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prenom">Prénom</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <i className="fas fa-user"></i>
              </span>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Votre prénom"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <i className="fas fa-user-tag"></i>
              </span>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Votre nom"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="vous@exemple.com"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="numTel">Numéro de téléphone</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <i className="fas fa-phone"></i>
              </span>
              <input
                type="tel"
                id="numTel"
                name="numTel"
                value={formData.numTel}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="+216 12 345 678"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <h3 className="section-title">Parcours académique</h3>
        <div className="form-group">
          <label htmlFor="nomFac">Institution</label>
          <div className="input-with-icon">
            <span className="input-icon">
              <i className="fas fa-school"></i>
            </span>
            <select
              id="nomFac"
              name="nomFac"
              value={formData.nomFac}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Choisissez une institution</option>
              {institutions.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="nomDep">Départements (séparés par des virgules)</label>
          <div className="input-with-icon">
            <span className="input-icon">
              <i className="fas fa-layer-group"></i>
            </span>
            <input
              type="text"
              id="nomDep"
              name="nomDep"
              value={formData.nomDep}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Informatique, Génie logiciel, ..."
            />
          </div>
        </div>

        {user && user.role === 'ENSEIGNANT' && (
          <div className="form-group">
            <label htmlFor="specialite">Spécialité (enseignant)</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </span>
              {currentSpecialites.length > 0 ? (
                <select
                  id="specialite"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Choisissez une spécialité</option>
                  {currentSpecialites.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="specialite"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Spécialité"
                />
              )}
            </div>
          </div>
        )}
      </section>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary profile-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Mise à jour...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i> Mettre à jour le profil
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;