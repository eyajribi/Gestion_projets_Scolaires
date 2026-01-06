package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.AuthProvider;
import com.Scolab.ScolabBackend.Entity.Enseignant;
import com.Scolab.ScolabBackend.Entity.Etudiant;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ConverUser {
    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public Enseignant convertirUtilisateurEnEnseignant(Utilisateur utilisateur) {
        // Créer un nouvel enseignant avec les données de l'utilisateur
        Enseignant enseignant = new Enseignant();
        enseignant.setId(utilisateur.getId());
        enseignant.setEmail(utilisateur.getEmail());
        enseignant.setNom(utilisateur.getNom());
        enseignant.setPrenom(utilisateur.getPrenom());
        enseignant.setRole(utilisateur.getRole());
        enseignant.setPassword(utilisateur.getPassword());
        enseignant.setNumTel(utilisateur.getNumTel());
        enseignant.setNomFac(utilisateur.getNomFac());
        enseignant.setNomDep(utilisateur.getNomDep());
        enseignant.setAuthProvider(AuthProvider.LOCAL);
        enseignant.setEstActif(true);
        enseignant.setEmailVerifie(true);
        enseignant.setDateCreation(LocalDateTime.now());
        enseignant.setDerniereConnexion(LocalDateTime.now());

        return (Enseignant) utilisateurRepository.save(enseignant);
    }

    public Etudiant convertirUtilisateurEnEtudiant(Utilisateur utilisateur) {
        // Créer un nouvel enseignant avec les données de l'utilisateur
        Etudiant etudiant = new Etudiant();
        etudiant.setId(utilisateur.getId());
        etudiant.setEmail(utilisateur.getEmail());
        etudiant.setNom(utilisateur.getNom());
        etudiant.setPrenom(utilisateur.getPrenom());
        etudiant.setRole(utilisateur.getRole());
        etudiant.setPassword(utilisateur.getPassword());
        etudiant.setNumTel(utilisateur.getNumTel());
        etudiant.setNomFac(utilisateur.getNomFac());
        etudiant.setNomDep(utilisateur.getNomDep());
        etudiant.setAuthProvider(AuthProvider.LOCAL);
        etudiant.setEstActif(true);
        etudiant.setEmailVerifie(true);
        etudiant.setDateCreation(LocalDateTime.now());
        etudiant.setDerniereConnexion(LocalDateTime.now());

        return (Etudiant) utilisateurRepository.save(etudiant);
    }
}
