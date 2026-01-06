package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.Projet;
import com.Scolab.ScolabBackend.Entity.Tache;
import com.Scolab.ScolabBackend.Entity.Notification;
import com.Scolab.ScolabBackend.Entity.Priorite;
import com.Scolab.ScolabBackend.Entity.StatutTache;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import com.Scolab.ScolabBackend.Repository.ProjetRepository;
import com.Scolab.ScolabBackend.Repository.TacheRepository;
import com.Scolab.ScolabBackend.Repository.LivrableRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.time.LocalDateTime;

@Service
public class EtudiantService {
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private ProjetRepository projetRepository;
    @Autowired
    private TacheRepository tacheRepository;
    @Autowired
    private LivrableRepository livrableRepository;

    public List<Projet> getProjets(String email) {
        // Récupérer l'étudiant par email
        var etudiantOpt = utilisateurRepository.findByEmail(email);
        if (etudiantOpt.isEmpty()) return List.of();
        var etudiant = etudiantOpt.get();
        // Récupérer les projets via les groupes auxquels l'étudiant appartient
        List<Projet> result = new ArrayList<>();
        for (Projet projet : projetRepository.findAll()) {
            if (projet.getGroupes() != null) {
                for (var groupe : projet.getGroupes()) {
                    if (groupe.getEtudiants() != null && groupe.getEtudiants().stream().anyMatch(e -> email.equals(e.getEmail()))) {
                        result.add(projet);
                        break;
                    }
                }
            }
        }
        return result;
    }

    public Object getProjetsCalendrier(String email) {
        List<Projet> calendrier = new ArrayList<>();
        Projet p1 = new Projet();
        p1.setId("1");
        p1.setNom("Projet Scolaire");
        p1.setDateDebut(LocalDateTime.of(2026, 1, 10, 0, 0));
        p1.setDateFin(LocalDateTime.of(2026, 2, 10, 0, 0));
        calendrier.add(p1);
        Projet p2 = new Projet();
        p2.setId("2");
        p2.setNom("Projet Math");
        p2.setDateDebut(LocalDateTime.of(2026, 1, 15, 0, 0));
        p2.setDateFin(LocalDateTime.of(2026, 3, 1, 0, 0));
        calendrier.add(p2);
        return calendrier;
    }

    public List<Tache> getTaches(String email, String sort) {
        var etudiantOpt = utilisateurRepository.findByEmail(email);
        if (etudiantOpt.isEmpty()) return List.of();
        var etudiant = etudiantOpt.get();
        List<Tache> taches = tacheRepository.findByEtudiantId(etudiant.getId());
        if ("date".equals(sort)) {
            taches.sort(Comparator.comparing(Tache::getDateEcheance));
        } else if ("priorite".equals(sort)) {
            taches.sort(Comparator.comparing(Tache::getPriorite).reversed());
        }
        return taches;
    }

    public Object soumettreLivrable(String email, String livrableId, MultipartFile fichier) {
        // Ici, on simule l'enregistrement du fichier. En vrai, il faudrait enregistrer le fichier et mettre à jour le livrable.
        return "Livrable '" + fichier.getOriginalFilename() + "' soumis pour l'étudiant " + email;
    }

    public Object getCommentairesLivrable(String email, String livrableId) {
        var livrableOpt = livrableRepository.findById(livrableId);
        if (livrableOpt.isEmpty()) return "Aucun livrable trouvé.";
        var livrable = livrableOpt.get();
        var eval = livrable.getEvaluation();
        if (eval == null) return "Aucune évaluation disponible.";
        return "Note: " + (eval.getNote() != null ? eval.getNote() : "N/A") + ". Commentaire: " + (eval.getCommentaires() != null ? eval.getCommentaires() : "N/A");
    }

    public Tache changerStatutTache(String email, String tacheId, String statut) {
        var tacheOpt = tacheRepository.findById(tacheId);
        if (tacheOpt.isEmpty()) return null;
        var tache = tacheOpt.get();
        // On suppose que le statut passé est le nom de l'enum StatutTache
        try {
            tache.setStatut(StatutTache.valueOf(statut.toUpperCase()));
        } catch (Exception e) {
            tache.setStatut(StatutTache.A_FAIRE);
        }
        return tacheRepository.save(tache);
    }

    public List<Notification> getNotifications(String email) {
        // À compléter si un NotificationRepository existe. Sinon, mock.
        List<Notification> notifications = new ArrayList<>();
        notifications.add(new Notification("1", "Rappel échéance", "Votre projet est bientôt dû", "2026-01-09", false, email));
        notifications.add(new Notification("2", "Tâche terminée", "Bravo pour la tâche rendue", "2026-01-12", true, email));
        return notifications;
    }
}
