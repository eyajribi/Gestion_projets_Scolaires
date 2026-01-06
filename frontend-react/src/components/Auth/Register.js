import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PasswordStrength from "./PasswordStrength";

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ENSEIGNANT",
    institution: "ISET de Radès",
    telephone: "",
    specialite: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [flashMessage, setFlashMessage] = useState("");

  const { register, error, clearError, loading: isLoading } = useAuth();
  const navigate = useNavigate();

  const institutions = [
    "ISET de Radès", "ISET de Nabeul", "ISET de Bizerte",
    "ISET de Kairouan", "ISET de Sousse", "Autre"
  ];

  const specialites = {
    "ISET de Radès": ["Informatique","Électronique","Mécanique","Gestion","Commerce"],
    "ISET de Nabeul": ["Informatique","Électronique","Mécanique","Textile"],
    "ISET de Bizerte": ["Informatique","Électronique","Mécanique"],
    "ISET de Kairouan": ["Informatique","Électronique","Mécanique"],
    "ISET de Sousse": ["Informatique","Électronique","Mécanique"],
    "Autre": [],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
    if (error) clearError();
    setFlashMessage("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!value) error = "L'email est requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Format d'email invalide";
        break;
      case "password":
        if (!value) error = "Le mot de passe est requis";
        else if (value.length < 8) error = "Minimum 8 caractères";
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          error = "Doit contenir majuscule, minuscule et chiffre";
        break;
      case "confirmPassword":
        if (!value) error = "Veuillez confirmer le mot de passe";
        else if (value !== formData.password) error = "Les mots de passe ne correspondent pas";
        break;
      case "nom":
      case "prenom":
        if (!value.trim()) error = `${name === "nom" ? "Nom" : "Prénom"} requis`;
        else if (value.trim().length < 2) error = "Au moins 2 caractères";
        break;
      case "telephone":
        if (value && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(value))
          error = "Format de téléphone invalide";
        break;
      default: break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    let isValid = true;
    ["nom","prenom","email","password","confirmPassword"].forEach(f => {
      if (!validateField(f, formData[f])) isValid = false;
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.keys(formData).reduce((acc,key)=>({ ...acc, [key]: true }),{}));
    if (!validateForm()) return;

    try {
      const response = await register(formData);

      if (response.message) {
        setFlashMessage(response.message); // message succès flash
      }

      //navigate("/verify-email");
    } catch (err) {
      console.error(err);
    }
  };

  const getCurrentSpecialites = () => specialites[formData.institution] || [];
  const hasErrors = Object.values(formErrors).some(e => e);

  return (
    <div className="auth-form-modern register-form">
      <div className="auth-header">
        <h2>Rejoindre EduProject</h2>
        <p className="auth-subtitle">Créez votre compte en 2 minutes</p>
      </div>

      {error && (
        <div className="alert-modern alert-error">
          <div className="alert-icon"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="alert-content"><p>{error}</p></div>
          <button onClick={clearError}><i className="fas fa-times"></i></button>
        </div>
      )}

      {flashMessage && (
        <div className="alert-modern alert-success">
          <div className="alert-icon"><i className="fas fa-check-circle"></i></div>
          <div className="alert-content">
            <p>{flashMessage}</p>
            <small>Veuillez cliquer sur le lien dans votre email pour continuer.</small>
          </div>
          <button onClick={() => setFlashMessage("")}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="input-group-modern">
            <div className="input-wrapper">
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=" "
                required
                disabled={isLoading}
                className={`input-modern ${
                  touched.prenom && formErrors.prenom ? "error" : ""
                }`}
                autoComplete="given-name"
                id="register-prenom"
              />
              <label className="input-label" htmlFor="register-prenom">
                Prénom
              </label>
              <div className="input-icon">
                <i className="fas fa-user"></i>
              </div>
            </div>
            {touched.prenom && formErrors.prenom && (
              <div className="input-error">
                <i className="fas fa-exclamation-circle"></i>
                {formErrors.prenom}
              </div>
            )}
          </div>

          <div className="input-group-modern">
            <div className="input-wrapper">
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=" "
                required
                disabled={isLoading}
                className={`input-modern ${
                  touched.nom && formErrors.nom ? "error" : ""
                }`}
                autoComplete="family-name"
                id="register-nom"
              />
              <label className="input-label" htmlFor="register-nom">
                Nom
              </label>
              <div className="input-icon">
                <i className="fas fa-user"></i>
              </div>
            </div>
            {touched.nom && formErrors.nom && (
              <div className="input-error">
                <i className="fas fa-exclamation-circle"></i>
                {formErrors.nom}
              </div>
            )}
          </div>
        </div>

        <div className="input-group-modern">
          <div className="input-wrapper">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder=" "
              required
              disabled={isLoading}
              className={`input-modern ${
                touched.email && formErrors.email ? "error" : ""
              }`}
              autoComplete="email"
              id="register-email"
            />
            <label className="input-label" htmlFor="register-email">
              Adresse email
            </label>
            <div className="input-icon">
              <i className="fas fa-at"></i>
            </div>
          </div>
          {touched.email && formErrors.email && (
            <div className="input-error">
              <i className="fas fa-exclamation-circle"></i>
              {formErrors.email}
            </div>
          )}
          <div className="input-hint">
            <i className="fas fa-info-circle"></i>Utilisez votre email personnel
            ou institutionnel
          </div>
        </div>

        <div className="input-group-modern">
          <div className="input-wrapper">
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=" "
                disabled={isLoading}
                className={`input-modern ${
                  touched.telephone && formErrors.telephone ? "error" : ""
                }`}
                autoComplete="tel"
                id="register-telephone"
              />
              <label className="input-label" htmlFor="register-telephone">
                Téléphone (optionnel)
              </label>
              <div className="input-icon">
                <i className="fas fa-phone"></i>
              </div>
            </div>
            {touched.telephone && formErrors.telephone && (
              <div className="input-error">
                <i className="fas fa-exclamation-circle"></i>
                {formErrors.telephone}
              </div>
            )}
          </div>
            
        <div className="input-group-modern">
          <div className="input-wrapper">
            <select
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              disabled={isLoading}
              className="input-modern"
              id="register-institution"
            >
              {institutions.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
            <label className="input-label" htmlFor="register-institution">
              Institution
            </label>
            <div className="input-icon">
              <i className="fas fa-school"></i>
            </div>
          </div>
        </div>

        {getCurrentSpecialites().length > 0 && (
          <div className="input-group-modern">
            <div className="input-wrapper">
              <select
                name="specialite"
                value={formData.specialite}
                onChange={handleChange}
                disabled={isLoading}
                className="input-modern"
                id="register-specialite"
              >
                <option value="">Choisissez une spécialité</option>
                {getCurrentSpecialites().map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
              <label className="input-label" htmlFor="register-specialite">
                Spécialité
              </label>
              <div className="input-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
            </div>
          </div>
        )}

        <div className="input-group-modern">
          <div className="input-wrapper">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder=" "
              required
              disabled={isLoading}
              className={`input-modern ${
                touched.password && formErrors.password ? "error" : ""
              }`}
              autoComplete="new-password"
              id="register-password"
            />
            <label className="input-label" htmlFor="register-password">
              Mot de passe
            </label>
            <div className="input-icon">
              <i className="fas fa-lock"></i>
            </div>
          </div>
          {formData.password && (
            <PasswordStrength password={formData.password} />
          )}
          {touched.password && formErrors.password && (
            <div className="input-error">
              <i className="fas fa-exclamation-circle"></i>
              {formErrors.password}
            </div>
          )}
          <div className="input-hint">
            <i className="fas fa-info-circle"></i>Minimum 8 caractères avec
            majuscule, minuscule et chiffre
          </div>
        </div>

        <div className="input-group-modern">
          <div className="input-wrapper">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder=" "
              required
              disabled={isLoading}
              className={`input-modern ${
                touched.confirmPassword && formErrors.confirmPassword
                  ? "error"
                  : ""
              }`}
              autoComplete="new-password"
              id="register-confirmPassword"
            />
            <label className="input-label" htmlFor="register-confirmPassword">
              Confirmer le mot de passe
            </label>
            <div className="input-icon">
              <i className="fas fa-lock"></i>
            </div>
          </div>
          {touched.confirmPassword && formErrors.confirmPassword && (
            <div className="input-error">
              <i className="fas fa-exclamation-circle"></i>
              {formErrors.confirmPassword}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn-modern btn-primary full-width"
          disabled={isLoading || hasErrors}
          data-loading={isLoading}
          aria-busy={isLoading}
        >
          <span className="btn-content">
            <i className="fas fa-rocket"></i>Créer mon compte
          </span>
          <div className="btn-loader">
            <div className="loader-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Déjà un compte ?{" "}
          <button
            onClick={onSwitchToLogin}
            className="link-modern link-accent"
            disabled={isLoading}
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
