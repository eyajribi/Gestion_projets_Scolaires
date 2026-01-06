import React, { useEffect, useState } from 'react';
import './AvatarUpload.css';

const AvatarUpload = ({ currentAvatar, onAvatarUpload, isLoading }) => {
  const [preview, setPreview] = useState(currentAvatar);
  const [hasLocalPreview, setHasLocalPreview] = useState(false);

  // Mettre à jour la preview depuis le backend uniquement
  // tant que l'utilisateur n'a pas choisi une image localement
  useEffect(() => {
    if (!hasLocalPreview) {
      setPreview(currentAvatar);
    }
  }, [currentAvatar, hasLocalPreview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille du fichier
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Créer une preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setHasLocalPreview(true);
    };
    reader.readAsDataURL(file);
    
    // Uploader le fichier
    onAvatarUpload(file);
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        {preview ? (
          <img src={preview} alt="Avatar" className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            <i className="fas fa-user"></i>
          </div>
        )}
        <label 
          htmlFor="avatar-upload" 
          className={`avatar-upload-label ${isLoading ? 'loading' : ''}`}
          title="Changer la photo"
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-camera"></i>
          )}
        </label>
      </div>
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
        style={{ display: 'none' }}
      />
      <div className="avatar-hint">
        {preview
          ? "Mettre à jour votre photo de profil"
          : "Ajoutez une photo de profil pour personnaliser votre compte."}
      </div>
    </div>
  );
};

export default AvatarUpload;