import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ChangePassword = ({ onClose, isOpen }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { changePassword, user } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer les messages quand l'utilisateur tape
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage('Tous les champs sont obligatoires');
      setMessageType('error');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Les nouveaux mots de passe ne correspondent pas');
      setMessageType('error');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères');
      setMessageType('error');
      return false;
    }

    // Validation de la force du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre');
      setMessageType('error');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage('Le nouveau mot de passe doit être différent de l\'actuel');
      setMessageType('error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.status === 'success') {
        setMessage('Mot de passe changé avec succès !');
        setMessageType('success');
        
        // Réinitialiser le formulaire
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Fermer après 2 secondes
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setMessage(response.message || 'Erreur lors du changement de mot de passe');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message || 'Une erreur est survenue');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengths = {
      1: { label: 'Faible', color: '#ff4d4f' },
      2: { label: 'Faible', color: '#ff4d4f' },
      3: { label: 'Moyen', color: '#faad14' },
      4: { label: 'Fort', color: '#52c41a' },
      5: { label: 'Très fort', color: '#52c41a' }
    };

    return { strength: (strength / 5) * 100, ...strengths[strength] };
  };

  const newPasswordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="change-password-overlay" onClick={onClose}>
      <div className="change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Changer le mot de passe</h2>
          <button className="close-button" onClick={onClose} aria-label="Fermer">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {message && (
            <div className={`alert-modern alert-${messageType}`} role="alert">
              <div className="alert-icon">
                <i className={`fas ${
                  messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'
                }`}></i>
              </div>
              <div className="alert-content">
                <p>{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Mot de passe actuel */}
            <div className="input-group-modern">
              <div className="input-wrapper">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  disabled={isLoading}
                  className="input-modern"
                  autoComplete="current-password"
                />
                <label className="input-label">Mot de passe actuel</label>
                <div className="input-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('current')}
                  disabled={isLoading}
                >
                  <i className={`fas ${showPasswords.current ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div className="input-group-modern">
              <div className="input-wrapper">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  disabled={isLoading}
                  className="input-modern"
                  autoComplete="new-password"
                />
                <label className="input-label">Nouveau mot de passe</label>
                <div className="input-icon">
                  <i className="fas fa-key"></i>
                </div>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('new')}
                  disabled={isLoading}
                >
                  <i className={`fas ${showPasswords.new ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              
              {/* Indicateur de force du mot de passe */}
              {formData.newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{
                        width: `${newPasswordStrength.strength}%`,
                        backgroundColor: newPasswordStrength.color
                      }}
                    ></div>
                  </div>
                  <span className="strength-label" style={{ color: newPasswordStrength.color }}>
                    {newPasswordStrength.label}
                  </span>
                </div>
              )}

              <div className="password-requirements">
                <p>Le mot de passe doit contenir :</p>
                <ul>
                  <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                    Au moins 8 caractères
                  </li>
                  <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                    Une lettre minuscule
                  </li>
                  <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                    Une lettre majuscule
                  </li>
                  <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>
                    Un chiffre
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirmation du mot de passe */}
            <div className="input-group-modern">
              <div className="input-wrapper">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  disabled={isLoading}
                  className="input-modern"
                  autoComplete="new-password"
                />
                <label className="input-label">Confirmer le nouveau mot de passe</label>
                <div className="input-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirm')}
                  disabled={isLoading}
                >
                  <i className={`fas ${showPasswords.confirm ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              
              {/* Indicateur de correspondance */}
              {formData.confirmPassword && (
                <div className={`password-match ${
                  formData.newPassword === formData.confirmPassword ? 'match' : 'no-match'
                }`}>
                  <i className={`fas ${
                    formData.newPassword === formData.confirmPassword ? 'fa-check' : 'fa-times'
                  }`}></i>
                  {formData.newPassword === formData.confirmPassword 
                    ? 'Les mots de passe correspondent' 
                    : 'Les mots de passe ne correspondent pas'
                  }
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-modern btn-outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn-modern btn-primary"
                disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                data-loading={isLoading}
              >
                <span className="btn-content">
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Modification...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save" style={{marginRight: "10px"}}></i> 
                         Changer
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;