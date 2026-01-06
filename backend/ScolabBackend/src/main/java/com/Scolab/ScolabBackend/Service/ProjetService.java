package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.*;
import com.Scolab.ScolabBackend.Repository.GroupeRepository;
import com.Scolab.ScolabBackend.Repository.ProjetRepository;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjetService {

    @Autowired
    private ConverUser converUser;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private GroupeRepository groupeRepository;

    public List<Projet> getProjetsByEnseignant(String email) {
        try {
            Utilisateur enseignant = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Enseignant non trouvé avec email: " + email));

            List<Projet> allProjets = projetRepository.findAll();

            // On renvoie uniquement les projets non archivés de cet enseignant
            return allProjets.stream()
                    .filter(projet -> projet.getEnseignant() != null
                            && enseignant.getId().equals(projet.getEnseignant().getId())
                            && (projet.getArchive() == null || !projet.getArchive()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public List<Projet> getProjetsArchivesByEnseignant(String email) {
        Utilisateur enseignant = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé avec email: " + email));

        List<Projet> allProjets = projetRepository.findAll();

        return allProjets.stream()
                .filter(projet -> projet.getEnseignant() != null
                        && enseignant.getId().equals(projet.getEnseignant().getId())
                        && Boolean.TRUE.equals(projet.getArchive()))
                .collect(Collectors.toList());
    }

    public Optional<Projet> getProjetById(String id) {
        return projetRepository.findById(id);
    }

    public Projet creerProjet(Projet projet, String enseignantId) {
        Utilisateur user = utilisateurRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("user non trouvé"));

        Enseignant enseignant = converUser.convertirUtilisateurEnEnseignant(user);
        projet.setEnseignant(enseignant);
        projet.setArchive(false);
        projet.setDateArchivage(null);
        projet.setDateCreation(LocalDateTime.now());
        projet.setPourcentageAvancement(0.0);
        projet.setStatut(StatutProjet.PLANIFIE);

        return projetRepository.save(projet);
    }

    public Projet modifierProjet(String id, Projet projetModifie) {
        return projetRepository.findById(id)
                .map(projet -> {
                    // Mettre à jour seulement les champs fournis
                    if (projetModifie.getNom() != null) {
                        projet.setNom(projetModifie.getNom());
                    }
                    if (projetModifie.getDescription() != null) {
                        projet.setDescription(projetModifie.getDescription());
                    }
                    if (projetModifie.getDateDebut() != null) {
                        projet.setDateDebut(projetModifie.getDateDebut());
                    }
                    if (projetModifie.getDateFin() != null) {
                        projet.setDateFin(projetModifie.getDateFin());
                    }
                    if (projetModifie.getStatut() != null) {
                        projet.setStatut(projetModifie.getStatut());
                    }

                    System.out.println("✏️  Modification du projet: " + projet.getNom()+projet);
                    return projetRepository.save(projet);
                })
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec ID: " + id));
    }

    public void supprimerProjet(String id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec ID: " + id));
        projet.setArchive(!projet.getArchive());
        projetRepository.save(projet);
        System.out.println("🗑️  Projet archive/resto avec ID: " + id);
    }

    public Tache ajouterTacheAuProjet(String projetId, Tache tache) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec ID: " + projetId));

        // Configurer la tâche
        tache.setProjetId(projetId);
        if (tache.getDateDebut() == null) {
            tache.setDateDebut(LocalDateTime.now());
        }
        if (tache.getStatut() == null) {
            tache.setStatut(StatutTache.A_FAIRE);
        }

        projet.ajouterTache(tache);

        Projet projetSauvegarde = projetRepository.save(projet);
        Tache nouvelleTache = projetSauvegarde.getTaches().get(projetSauvegarde.getTaches().size() - 1);

        System.out.println("✅ Tâche ajoutée au projet: " + nouvelleTache.getTitre());
        return nouvelleTache;
    }

    public List<Projet> getProjetsEnRetard() {
        return projetRepository.findProjetsEnRetard(LocalDateTime.now());
    }

    public Projet changerStatutProjet(String projetId, StatutProjet nouveauStatut) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        projet.setStatut(nouveauStatut);
        return projetRepository.save(projet);
    }

    public Projet assignerGroupeAuProjet(String projetId, String groupeId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec ID: " + projetId));

        Groupe groupe = groupeRepository.findById(groupeId)
                .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec ID: " + groupeId));

        boolean dejaAssigne = projet.getGroupes().stream()
                .anyMatch(g -> g.getId().equals(groupeId));

        if (!dejaAssigne) {
            projet.getGroupes().add(groupe);
            System.out.println("👥 Groupe " + groupe.getNom() + " assigné au projet " + projet.getNom());
        } else {
            System.out.println("ℹ️  Groupe déjà assigné au projet");
        }

        return projetRepository.save(projet);
    }

    public List<Tache> getTachesDuProjet(String projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        return projet.getTaches();
    }

    public Projet archiverProjet(String id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec ID: " + id));
        projet.setArchive(true);
        projet.setDateArchivage(LocalDateTime.now());
        return projetRepository.save(projet);
    }

    public Projet restaurerProjet(String id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec ID: " + id));
        projet.setArchive(false);
        projet.setDateArchivage(null);
        return projetRepository.save(projet);
    }
}
