package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.Etudiant;
import com.Scolab.ScolabBackend.Entity.Groupe;
import com.Scolab.ScolabBackend.Entity.Projet;
import com.Scolab.ScolabBackend.Repository.GroupeRepository;
import com.Scolab.ScolabBackend.Repository.ProjetRepository;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final ProjetRepository projetRepository;
    private final GroupeRepository groupeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;

    /**
     * Notification lors de la création d'un projet.
     */
    public void notifyProjectCreated(String projetId, List<String> groupeIds) {
        Optional<Projet> optProjet = projetRepository.findById(projetId);
        if (optProjet.isEmpty()) {
            throw new RuntimeException("Projet non trouvé avec l'id: " + projetId);
        }
        Projet projet = optProjet.get();

        Set<Etudiant> destinataires = collectEtudiantsFromGroupes(groupeIds);

        for (Etudiant etu : destinataires) {
            try {
                emailService.sendProjectCreatedEmail(etu.getEmail(), etu.getNom(), etu.getPrenom(), projet);
            } catch (RuntimeException ex) {
                // On log seulement pour ne pas bloquer toute la boucle
                System.err.println("Erreur envoi email projet créé à " + etu.getEmail() + ": " + ex.getMessage());
            }
        }
    }

    /**
     * Notification de rappel d'échéance de projet.
     */
    public void notifyProjectDeadline(String projetId, List<String> groupeIds) {
        Optional<Projet> optProjet = projetRepository.findById(projetId);
        if (optProjet.isEmpty()) {
            throw new RuntimeException("Projet non trouvé avec l'id: " + projetId);
        }
        Projet projet = optProjet.get();

        Set<Etudiant> destinataires = collectEtudiantsFromGroupes(groupeIds);

        for (Etudiant etu : destinataires) {
            try {
                emailService.sendProjectDeadlineEmail(etu.getEmail(), etu.getNom(), etu.getPrenom(), projet);
            } catch (RuntimeException ex) {
                System.err.println("Erreur envoi email échéance projet à " + etu.getEmail() + ": " + ex.getMessage());
            }
        }
    }

    /**
     * Notification personnalisée vers une liste d'étudiants.
     */
    public void sendCustomNotification(List<String> utilisateurIds, String titre, String message) {
        utilisateurRepository.findAllById(utilisateurIds).forEach(user -> {
            try {
                emailService.sendCustomNotificationEmail(user.getEmail(), user.getNom(), user.getPrenom(), titre, message);
            } catch (RuntimeException ex) {
                System.err.println("Erreur envoi email custom à " + user.getEmail() + ": " + ex.getMessage());
            }
        });
    }

    private Set<Etudiant> collectEtudiantsFromGroupes(List<String> groupeIds) {
        Set<Etudiant> result = new HashSet<>();
        for (String groupeId : groupeIds) {
            Groupe groupe = groupeRepository.findById(groupeId)
                    .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec l'id: " + groupeId));
            if (groupe.getEtudiants() != null) {
                result.addAll(groupe.getEtudiants());
            }
        }
        return result;
    }
}
