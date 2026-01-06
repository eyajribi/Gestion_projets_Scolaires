package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.Groupe;
import com.Scolab.ScolabBackend.Entity.Etudiant;
import com.Scolab.ScolabBackend.Entity.Projet;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Repository.GroupeRepository;
import com.Scolab.ScolabBackend.Repository.ProjetRepository;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GroupeService {

    private final GroupeRepository groupeRepository;
    private final UtilisateurService etudiantRepository;
    private final ProjetRepository projetRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ConverUser converUser;

    public List<Groupe> getAllGroupes() {
        try {
            List<Groupe> groupes = groupeRepository.findAll();
            System.out.println("👥 Groupes récupérés: " + groupes.size());
            return groupes;
        } catch (Exception e) {
            System.err.println("❌ Erreur getAllGroupes: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des groupes");
        }
    }

    public Optional<Groupe> getGroupeById(String id) {
        try {
            Optional<Groupe> groupe = groupeRepository.findById(id);
            if (groupe.isPresent()) {
                System.out.println("📋 Groupe trouvé: " + groupe.get().getNom());
            } else {
                System.out.println("⚠️ Groupe non trouvé avec ID: " + id);
            }
            return groupe;
        } catch (Exception e) {
            System.err.println("❌ Erreur getGroupeById: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération du groupe");
        }
    }

    public Groupe createGroupe(Groupe groupe) {
        try {
            groupe.setDateCreation(LocalDateTime.now());
            groupe.setPourcentageAvancement(0.0);
            groupe.setArchive(false);
            Groupe nouveauGroupe = groupeRepository.save(groupe);
            System.out.println("✅ Groupe créé: " + nouveauGroupe.getNom() + " (ID: " + nouveauGroupe.getId() + ")");
            return nouveauGroupe;
        } catch (Exception e) {
            System.err.println("❌ Erreur createGroupe: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la création du groupe");
        }
    }

    public Groupe updateGroupe(String id, Groupe groupeDetails) {
        try {
            return groupeRepository.findById(id)
                    .map(groupe -> {
                        if (groupeDetails.getNom() != null) {
                            groupe.setNom(groupeDetails.getNom());
                        }
                        if (groupeDetails.getDescription() != null) {
                            groupe.setDescription(groupeDetails.getDescription());
                        }
                        if (groupeDetails.getPourcentageAvancement() != null) {
                            groupe.setPourcentageAvancement(groupeDetails.getPourcentageAvancement());
                        }

                        Groupe groupeMaj = groupeRepository.save(groupe);
                        System.out.println("✏️ Groupe modifié: " + groupeMaj.getNom());
                        return groupeMaj;
                    })
                    .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec l'id: " + id));
        } catch (Exception e) {
            System.err.println("❌ Erreur updateGroupe: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la modification du groupe");
        }
    }

    public void deleteGroupe(String id) {
        try {
            Groupe groupe = groupeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec l'id: " + id));
            groupe.setArchive(!groupe.getArchive());
            groupeRepository.save(groupe);
            System.out.println("🗑️ Groupe archive avec ID: " + id);
        } catch (Exception e) {
            System.err.println("❌ Erreur deleteGroupe: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la archi/resto du groupe");
        }
    }

    public Groupe ajouterEtudiantAuGroupe(String groupeId, String etudiantId) {
        try {
            Groupe groupe = groupeRepository.findById(groupeId)
                    .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec l'id: " + groupeId));

            Utilisateur etudiant = utilisateurRepository.findById(etudiantId)
                    .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec l'id: " + etudiantId));

            boolean dejaPresent = groupe.getEtudiants().stream()
                    .anyMatch(e -> e.getId().equals(etudiantId));

            Etudiant e;
            if (!dejaPresent) {
                e=converUser.convertirUtilisateurEnEtudiant(etudiant);
                groupe.ajouterEtudiant(e);
                Groupe groupeMaj = groupeRepository.save(groupe);
                System.out.println("✅ Étudiant " + etudiant.getNom() + " ajouté au groupe " + groupe.getNom());
                return groupeMaj;
            } else {
                System.out.println("ℹ️ Étudiant déjà présent dans le groupe");
                return groupe;
            }
        } catch (Exception e) {
            System.err.println("❌ Erreur ajouterEtudiantAuGroupe: " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'ajout de l'étudiant au groupe");
        }
    }

    public Groupe retirerEtudiantDuGroupe(String groupeId, String etudiantId) {
        try {
            Groupe groupe = groupeRepository.findById(groupeId)
                    .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec l'id: " + groupeId));

            Utilisateur etudiant = utilisateurRepository.findById(etudiantId)
                    .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec l'id: " + etudiantId));

            groupe.retirerEtudiant((Etudiant) etudiant);
            Groupe groupeMaj = groupeRepository.save(groupe);
            System.out.println("➖ Étudiant " + etudiant.getNom() + " retiré du groupe " + groupe.getNom());
            return groupeMaj;
        } catch (Exception e) {
            System.err.println("❌ Erreur retirerEtudiantDuGroupe: " + e.getMessage());
            throw new RuntimeException("Erreur lors du retrait de l'étudiant du groupe");
        }
    }

    public Groupe ajouterProjetAuGroupe(String groupeId, String projetId) {
        try {
            Groupe groupe = groupeRepository.findById(groupeId)
                    .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec l'id: " + groupeId));

            Projet projet = projetRepository.findById(projetId)
                    .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'id: " + projetId));

            // Vérifier si le projet n'est pas déjà associé au groupe
            boolean dejaAssocie = groupe.getProjets().stream()
                    .anyMatch(p -> p.getId().equals(projetId));

            if (!dejaAssocie) {
                groupe.getProjets().add(projet);
                Groupe groupeMaj = groupeRepository.save(groupe);
                System.out.println("✅ Projet " + projet.getNom() + " ajouté au groupe " + groupe.getNom());
                return groupeMaj;
            } else {
                System.out.println("ℹ️ Projet déjà associé au groupe");
                return groupe;
            }
        } catch (Exception e) {
            System.err.println("❌ Erreur ajouterProjetAuGroupe: " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'ajout du projet au groupe");
        }
    }

    public Groupe calculerAvancementGroupe(String groupeId) {
        try {
            Groupe groupe = groupeRepository.findById(groupeId)
                    .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec l'id: " + groupeId));

            groupe.calculerAvancementGroupe();
            Groupe groupeMaj = groupeRepository.save(groupe);
            System.out.println("📊 Avancement calculé pour le groupe " + groupe.getNom() + ": " + groupeMaj.getPourcentageAvancement() + "%");
            return groupeMaj;
        } catch (Exception e) {
            System.err.println("❌ Erreur calculerAvancementGroupe: " + e.getMessage());
            throw new RuntimeException("Erreur lors du calcul de l'avancement du groupe");
        }
    }

    public List<Etudiant> getEtudiantsByGroupe(String groupeId) {
        try {
            Groupe groupe = groupeRepository.findById(groupeId)
                    .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec l'id: " + groupeId));

            List<Etudiant> etudiants = groupe.getEtudiants();
            System.out.println("🎓 Étudiants du groupe " + groupe.getNom() + ": " + etudiants.size());
            return etudiants;
        } catch (Exception e) {
            System.err.println("❌ Erreur getEtudiantsByGroupe: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des étudiants du groupe");
        }
    }

    public List<Projet> getProjetsByGroupe(String groupeId) {
        try {
            Groupe groupe = groupeRepository.findById(groupeId)
                    .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec l'id: " + groupeId));

            List<Projet> projets = groupe.getProjets();
            System.out.println("📁 Projets du groupe " + groupe.getNom() + ": " + projets.size());
            return projets;
        } catch (Exception e) {
            System.err.println("❌ Erreur getProjetsByGroupe: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la récupération des projets du groupe");
        }
    }
}