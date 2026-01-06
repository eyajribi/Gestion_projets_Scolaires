package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.Enseignant;
import com.Scolab.ScolabBackend.Entity.Etudiant;
import com.Scolab.ScolabBackend.Entity.Role;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public List<Etudiant> getAllEtudiants() {
        return utilisateurRepository.findAllEtudiants();
    }

    public List<Enseignant> getAllEnseignants() {
        return utilisateurRepository.findAllEnseignants();
    }

    public Optional<Utilisateur> getUtilisateurById(String id) {
        return utilisateurRepository.findById(id);
    }

    public Optional<Etudiant> getEtudiantById(String id) {
        return utilisateurRepository.findEtudiantById(id);
    }

    public Optional<Enseignant> getEnseignantById(String id) {
        return utilisateurRepository.findEnseignantById(id);
    }

    public Etudiant createEtudiant(Etudiant etudiant) {
        // S'assurer que le rôle est correct
        etudiant.setRole(Role.ETUDIANT);
        etudiant.setDateCreation(LocalDateTime.now());
        etudiant.setEstActif(true);
        return utilisateurRepository.save(etudiant);
    }

    public Enseignant createEnseignant(Enseignant enseignant) {
        // S'assurer que le rôle est correct
        enseignant.setRole(Role.ENSEIGNANT);
        enseignant.setDateCreation(LocalDateTime.now());
        enseignant.setEstActif(true);
        return utilisateurRepository.save(enseignant);
    }

    public Etudiant updateEtudiant(String id, Etudiant etudiantModifie) {
        return utilisateurRepository.findEtudiantById(id)
                .map(etudiant -> {
                    etudiant.setNom(etudiantModifie.getNom());
                    etudiant.setPrenom(etudiantModifie.getPrenom());
                    etudiant.setEmail(etudiantModifie.getEmail());
                    etudiant.setNumTel(etudiantModifie.getNumTel());
                    etudiant.setUrlPhotoProfil(etudiantModifie.getUrlPhotoProfil());
                    etudiant.setNomFac(etudiantModifie.getNomFac());
                    etudiant.setNomDep(etudiantModifie.getNomDep());
                    etudiant.setNiveau(etudiantModifie.getNiveau());
                    etudiant.setFiliere(etudiantModifie.getFiliere());
                    etudiant.setDateModification(LocalDateTime.now());
                    return utilisateurRepository.save(etudiant);
                })
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
    }

    public Enseignant updateEnseignant(String id, Enseignant enseignantModifie) {
        return utilisateurRepository.findEnseignantById(id)
                .map(enseignant -> {
                    enseignant.setNom(enseignantModifie.getNom());
                    enseignant.setPrenom(enseignantModifie.getPrenom());
                    enseignant.setEmail(enseignantModifie.getEmail());
                    enseignant.setNumTel(enseignantModifie.getNumTel());
                    enseignant.setUrlPhotoProfil(enseignantModifie.getUrlPhotoProfil());
                    enseignant.setNomFac(enseignantModifie.getNomFac());
                    enseignant.setNomDep(enseignantModifie.getNomDep());
                    enseignant.setSpecialite(enseignantModifie.getSpecialite());
                    enseignant.setDateModification(LocalDateTime.now());
                    return utilisateurRepository.save(enseignant);
                })
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
    }

    public void deleteUtilisateur(String id) {
        utilisateurRepository.deleteById(id);
    }

    public void activateUser(String id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        utilisateur.activerCompte();
        utilisateur.setDateModification(LocalDateTime.now());
        utilisateurRepository.save(utilisateur);
    }

    public void deactivateUser(String id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        utilisateur.desactiverCompte();
        utilisateur.setDateModification(LocalDateTime.now());
        utilisateurRepository.save(utilisateur);
    }
}