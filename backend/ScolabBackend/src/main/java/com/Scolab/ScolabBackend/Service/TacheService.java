package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.*;
import com.Scolab.ScolabBackend.Repository.TacheRepository;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TacheService {

    @Autowired
    private ConverUser converUser;

    private final TacheRepository tacheRepository;
    private final UtilisateurRepository utilisateurRepository;

    public List<Tache> getTachesByEtudiant(String etudiantId) {
        List<Tache> taches = tacheRepository.findByEtudiantId(etudiantId);
        System.out.println("📋 Tâches trouvées pour étudiant " + etudiantId + ": " + taches.size());
        return taches;
    }

    public List<Tache> getTachesEnRetard() {
        List<Tache> tachesEnRetard = tacheRepository.findTachesEnRetard(LocalDateTime.now());
        System.out.println("⏰ Tâches en retard: " + tachesEnRetard.size());
        return tachesEnRetard;
    }

    public Tache assignerTacheAEtudiant(String tacheId, String etudiantId) {
        Tache tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée avec ID: " + tacheId));

        // Rechercher l'étudiant avec vérification du rôle
        Utilisateur utilisateur = utilisateurRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID: " + etudiantId));

        if (utilisateur.getRole() != Role.ETUDIANT) {
            throw new RuntimeException("L'utilisateur " + utilisateur.getEmail() + " n'est pas un étudiant");
        }

        Etudiant etudiant;
        if (utilisateur instanceof Etudiant) {
            etudiant = (Etudiant) utilisateur;
        } else {
            // Créer un objet Etudiant à partir de l'utilisateur
            etudiant = converUser.convertirUtilisateurEnEtudiant(utilisateur);
        }

        // Vérifier si l'étudiant n'est pas déjà assigné
        boolean dejaAssigne = tache.getAssignesA().stream()
                .anyMatch(e -> e.getId().equals(etudiantId));

        if (!dejaAssigne) {
            tache.getAssignesA().add(etudiant);
            System.out.println("✅ Étudiant " + etudiant.getNom() + " assigné à la tâche " + tache.getTitre());
            return tacheRepository.save(tache);
        } else {
            System.out.println("ℹ️  Étudiant déjà assigné à cette tâche");
            return tache;
        }
    }

    public Tache updateTache(String id, Tache tacheModifiee) {
        return tacheRepository.findById(id)
                .map(tache -> {
                    // Mettre à jour seulement les champs fournis
                    if (tacheModifiee.getTitre() != null) {
                        tache.setTitre(tacheModifiee.getTitre());
                    }
                    if (tacheModifiee.getDescription() != null) {
                        tache.setDescription(tacheModifiee.getDescription());
                    }
                    if (tacheModifiee.getPriorite() != null) {
                        tache.setPriorite(tacheModifiee.getPriorite());
                    }
                    if (tacheModifiee.getStatut() != null) {
                        tache.setStatut(tacheModifiee.getStatut());
                    }
                    if (tacheModifiee.getDateDebut() != null) {
                        tache.setDateDebut(tacheModifiee.getDateDebut());
                    }
                    if (tacheModifiee.getDateEcheance() != null) {
                        tache.setDateEcheance(tacheModifiee.getDateEcheance());
                    }

                    // Si le statut devient TERMINEE, mettre à jour la date de fin
                    if (tacheModifiee.getStatut() == StatutTache.TERMINEE && tache.getDateFin() == null) {
                        tache.setDateFin(LocalDateTime.now());
                        System.out.println("🏁 Tâche marquée comme terminée: " + tache.getTitre());
                    }

                    System.out.println("✏️  Tâche mise à jour: " + tache.getTitre());
                    return tacheRepository.save(tache);
                })
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée avec ID: " + id));
    }

    public void deleteTache(String id) {
        tacheRepository.deleteById(id);
        System.out.println("🗑️  Tâche supprimée avec ID: " + id);
    }

    public Optional<Tache> getTacheById(String id) {
        Optional<Tache> tache = tacheRepository.findById(id);
        if (tache.isPresent()) {
            System.out.println("🔍 Tâche trouvée: " + tache.get().getTitre());
        } else {
            System.out.println("❌ Tâche non trouvée avec ID: " + id);
        }
        return tache;
    }

    public List<Tache> getTachesByProjet(String projetId) {
        List<Tache> taches = tacheRepository.findByProjetId(projetId);
        System.out.println("📁 Tâches du projet " + projetId + ": " + taches.size());
        return taches;
    }

    public List<Tache> getTachesByProjetAndStatut(String projetId, StatutTache statut) {
        List<Tache> taches = tacheRepository.findByProjetAndStatut(projetId, statut);
        System.out.println("📊 Tâches du projet " + projetId + " avec statut " + statut + ": " + taches.size());
        return taches;
    }

    public Tache changerStatutTache(String tacheId, StatutTache nouveauStatut) {
        Tache tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée avec ID: " + tacheId));

        tache.setStatut(nouveauStatut);

        // Si la tâche est terminée, mettre à jour la date de fin
        if (nouveauStatut == StatutTache.TERMINEE && tache.getDateFin() == null) {
            tache.setDateFin(LocalDateTime.now());
        }

        System.out.println("🔄 Statut de la tâche " + tache.getTitre() + " changé à: " + nouveauStatut);
        return tacheRepository.save(tache);
    }

    public Tache creerTache(Tache tache) {
        // Valeurs par défaut
        if (tache.getDateDebut() == null) {
            tache.setDateDebut(LocalDateTime.now());
        }
        if (tache.getStatut() == null) {
            tache.setStatut(StatutTache.A_FAIRE);
        }
        if (tache.getPriorite() == null) {
            tache.setPriorite(Priorite.MOYENNE);
        }

        if (tache.getAssignesA() != null) {
            for (Etudiant etu : tache.getAssignesA()) {
                if (etu.getRole() == null) {
                    etu.setRole(Role.ETUDIANT);
                }
            }
        }

        Tache tacheSauvegardee = tacheRepository.save(tache);
        System.out.println("✅ Tâche créée: " + tacheSauvegardee.getTitre() + " (ID: " + tacheSauvegardee.getId() + ")");
        return tacheSauvegardee;
    }

    public Tache retirerEtudiantDeTache(String tacheId, String etudiantId) {
        Tache tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée avec ID: " + tacheId));

        int tailleAvant = tache.getAssignesA().size();
        tache.getAssignesA().removeIf(etudiant -> etudiant.getId().equals(etudiantId));
        int tailleApres = tache.getAssignesA().size();

        if (tailleApres < tailleAvant) {
            System.out.println("❌ Étudiant " + etudiantId + " retiré de la tâche " + tache.getTitre());
            return tacheRepository.save(tache);
        } else {
            System.out.println("ℹ️  Étudiant non trouvé dans la tâche");
            return tache;
        }
    }
}