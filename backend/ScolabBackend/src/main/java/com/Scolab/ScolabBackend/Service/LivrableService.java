package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.*;
import com.Scolab.ScolabBackend.Repository.LivrableRepository;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import com.Scolab.ScolabBackend.Repository.ProjetRepository;
import com.Scolab.ScolabBackend.Repository.GroupeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LivrableService {

    @Autowired
    private ConverUser converUser;

    private final LivrableRepository livrableRepository;
    private final FichierStorageService fichierStorageService;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;
    private final ProjetRepository projetRepository;
    private final GroupeRepository groupeRepository;

    public Livrable soumettreLivrable(String livrableId, MultipartFile fichier, String groupeId) throws IOException {
        Livrable livrable = livrableRepository.findById(livrableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé avec ID: " + livrableId));

        System.out.println("📤 Soumission du livrable: " + livrable.getNom() + " par le groupe: " + groupeId);

        // Vérifier que le groupe peut soumettre ce livrable
        if (!livrable.getGroupe().getId().equals(groupeId)) {
            throw new RuntimeException("Ce groupe ne peut pas soumettre ce livrable. Groupe attendu: " +
                    livrable.getGroupe().getId() + ", Groupe fourni: " + groupeId);
        }

        // Vérifier que le livrable peut être soumis
        if (!livrable.peutEtreSoumis()) {
            throw new RuntimeException("Ce livrable ne peut pas être soumis dans son état actuel: " + livrable.getStatut());
        }

        // Vérifier la date d'échéance
        if (livrable.estEnRetard()) {
            throw new RuntimeException("La date d'échéance est dépassée. Date limite: " + livrable.getDateEcheance());
        }

        // Stocker le fichier
        Fichier fichierStocke = fichierStorageService.stockerFichier(fichier);
        System.out.println("💾 Fichier stocké: " + fichierStocke.getNom());

        // Mettre à jour le livrable
        livrable.soumettreFichier(fichierStocke);

        Livrable livrableSoumis = livrableRepository.save(livrable);
        System.out.println("✅ Livrable soumis avec succès: " + livrableSoumis.getNom());

        // Notification à l'enseignant
        if (livrable.getProjet() != null && livrable.getProjet().getEnseignant() != null) {
            Utilisateur enseignant = livrable.getProjet().getEnseignant();
            String enseignantNom = enseignant.getNom();
            String enseignantPrenom = enseignant.getPrenom();
            String enseignantEmail = enseignant.getEmail();
            String groupeNom = livrable.getGroupe() != null ? livrable.getGroupe().getNom() : "";
            String projetNom = livrable.getProjet().getNom();
            String livrableNom = livrable.getNom();
            String dateSoumission = livrableSoumis.getDateSoumission() != null ? livrableSoumis.getDateSoumission().toString() : "";
            emailService.sendLivrableSubmittedEmail(
                enseignantEmail,
                enseignantNom,
                enseignantPrenom,
                groupeNom,
                projetNom,
                livrableNom,
                dateSoumission
            );
        }

        return livrableSoumis;
    }

    public Livrable evaluerLivrable(String livrableId, Double note, String commentaires, String enseignantId) {
        Livrable livrable = livrableRepository.findById(livrableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé avec ID: " + livrableId));

        // Vérifier que le livrable est dans un état évaluable
        if (!livrable.estSoumis()) {
            throw new RuntimeException("Ce livrable ne peut pas être évalué dans son état actuel: " + livrable.getStatut());
        }

        if (livrable.getFichier() == null || livrable.getDateSoumission() == null) {
            throw new RuntimeException("Ce livrable n'a pas encore été soumis et ne peut pas être évalué.");
        }

        // Vérifier la validité de la note
        if (note == null) {
            throw new RuntimeException("La note est obligatoire.");
        }
        Evaluation evaluationTemp = new Evaluation();
        evaluationTemp.setNote(note);
        if (!evaluationTemp.estValide()) {
            throw new RuntimeException("La note doit être comprise entre 0 et 20.");
        }

        // Rechercher l'enseignant avec vérification du rôle
        Utilisateur utilisateur = utilisateurRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID: " + enseignantId));

        if (utilisateur.getRole() != Role.ENSEIGNANT) {
            throw new RuntimeException("L'utilisateur " + utilisateur.getEmail() + " n'est pas un enseignant");
        }

        Enseignant enseignant;
        if (utilisateur instanceof Enseignant) {
            enseignant = (Enseignant) utilisateur;
        } else {
            // Créer un objet Enseignant à partir de l'utilisateur
            enseignant = converUser.convertirUtilisateurEnEnseignant(utilisateur);
        }

        // Vérifier que l'enseignant peut évaluer ce livrable
        if (livrable.getProjet() == null || livrable.getProjet().getEnseignant() == null) {
            throw new RuntimeException("Aucun enseignant n'est associé au projet de ce livrable.");
        }

        if (!livrable.getProjet().getEnseignant().getId().equals(enseignantId)) {
            throw new RuntimeException("Cet enseignant ne peut pas évaluer ce livrable. Enseignant du projet: " +
                    livrable.getProjet().getEnseignant().getId());
        }

        // Évaluer ou réévaluer le livrable (logique métier dans l'entité)
        livrable.evaluerLivrable(note, commentaires, enseignant);

        Livrable livrableEvalue = livrableRepository.save(livrable);
        System.out.println("📊 Livrable évalué: " + livrableEvalue.getNom() + " - Note: " + note);

        // Après évaluation, envoyer un email au(x) étudiant(s) du groupe concerné
        if (livrable.getGroupe() != null && livrable.getGroupe().getEtudiants() != null) {
            livrable.getGroupe().getEtudiants().forEach(etu -> {
                try {
                    emailService.sendLivrableEvaluatedEmail(
                            etu.getEmail(),
                            etu.getNom(),
                            etu.getPrenom(),
                            livrableEvalue
                    );
                } catch (RuntimeException ex) {
                    System.err.println("Erreur envoi email livrable évalué à " + etu.getEmail() + ": " + ex.getMessage());
                }
            });
        }

        return livrableEvalue;
    }

    public Livrable mettreEnCorrection(String livrableId, String enseignantId) {
        Livrable livrable = livrableRepository.findById(livrableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé avec ID: " + livrableId));

        // Vérifier les permissions
        if (!livrable.getProjet().getEnseignant().getId().equals(enseignantId)) {
            throw new RuntimeException("Non autorisé. Enseignant du projet: " +
                    livrable.getProjet().getEnseignant().getId());
        }

        livrable.mettreEnCorrection();

        Livrable livrableCorrige = livrableRepository.save(livrable);
        System.out.println("🔧 Livrable mis en correction: " + livrableCorrige.getNom());
        return livrableCorrige;
    }

    public Livrable rejeterSoumission(String livrableId, String enseignantId) {
        Livrable livrable = livrableRepository.findById(livrableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé avec ID: " + livrableId));

        // Vérifier les permissions
        if (!livrable.getProjet().getEnseignant().getId().equals(enseignantId)) {
            throw new RuntimeException("Non autorisé. Enseignant du projet: " +
                    livrable.getProjet().getEnseignant().getId());
        }

        livrable.rejeterSoumission();

        Livrable livrableRejete = livrableRepository.save(livrable);
        System.out.println("❌ Soumission rejetée pour le livrable: " + livrableRejete.getNom());
        return livrableRejete;
    }

    public List<Livrable> getLivrablesByProjet(String projetId) {
        List<Livrable> livrables = livrableRepository.findByProjetId(projetId);
        System.out.println("📁 Livrables du projet " + projetId + ": " + livrables.size());
        return livrables;
    }

    public List<Livrable> getLivrablesByGroupe(String groupeId) {
        List<Livrable> livrables = livrableRepository.findByGroupeId(groupeId);
        System.out.println("👥 Livrables du groupe " + groupeId + ": " + livrables.size());
        return livrables;
    }

    public List<Livrable> getLivrablesEnRetard() {
        List<Livrable> livrablesEnRetard = livrableRepository.findLivrablesEnRetard(LocalDateTime.now());
        System.out.println("⏰ Livrables en retard: " + livrablesEnRetard.size());
        return livrablesEnRetard;
    }

    /**
     * Retourne la liste des livrables pour un enseignant à partir de son email.
     * Recherche tous les projets de l'enseignant, puis tous les livrables de ces projets.
     * Affiche aussi les IDs des projets dans la console.
     */
    public List<Livrable> getLivrablesByEnseignant(String email) {
        Utilisateur enseignant = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé avec l'email: " + email));
        String enseignantId = enseignant.getId();
        // Récupérer tous les projets de l'enseignant
        List<Projet> allProjets = projetRepository.findAll();

        // On renvoie uniquement les projets non archivés de cet enseignant
        List<Projet> projets = allProjets.stream()
                .filter(projet -> projet.getEnseignant() != null
                        && enseignantId.equals(projet.getEnseignant().getId())
                        && (projet.getArchive() == null || !projet.getArchive()))
                .collect(Collectors.toList());
        System.out.println("--- Liste des projets de l'enseignant " + email + " ---");
        for (Projet projet : projets) {
            System.out.println("Projet: " + projet.getNom() + " | ID: " + projet.getId());
        }
        // Récupérer tous les livrables de ces projets
        List<Livrable> allLivrables = new java.util.ArrayList<>();
        for (Projet projet : projets) {
            List<Livrable> livrablesProjet = livrableRepository.findByProjetId(projet.getId());
            allLivrables.addAll(livrablesProjet);
        }
        System.out.println("👨‍🏫 Livrables de l'enseignant " + enseignantId + " (" + email + "): " + allLivrables.size());
        return allLivrables;
    }

    public Optional<Livrable> getLivrableById(String id) {
        Optional<Livrable> livrable = livrableRepository.findById(id);
        if (livrable.isPresent()) {
            System.out.println("🔍 Livrable trouvé: " + livrable.get().getNom());
        } else {
            System.out.println("❌ Livrable non trouvé avec ID: " + id);
        }
        return livrable;
    }

    /**
     * Crée un livrable pour un projet et un groupe donnés, retourne l'ID du livrable créé.
     */
    public String creerLivrable(String titre, String description, String projetId, String groupeId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec ID: " + projetId));
        Groupe groupe = groupeRepository.findById(groupeId)
                .orElseThrow(() -> new RuntimeException("Groupe non trouvé avec ID: " + groupeId));
        Livrable livrable = new Livrable();
        livrable.setNom(titre);
        livrable.setDescription(description);
        livrable.setProjet(projet);
        livrable.setGroupe(groupe);
        livrable.setStatut(StatutLivrable.A_SOUMETTRE);
        // Optionnel: définir une date d'échéance fictive pour le test
        livrable.setDateEcheance(java.time.LocalDateTime.now().plusDays(7));
        Livrable saved = livrableRepository.save(livrable);
        return saved.getId();
    }

    /**
     * Retourne l'ID de l'enseignant à partir de son email, ou null si non trouvé ou non enseignant.
     */
    public String getEnseignantIdByEmail(String email) {
        return utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.ENSEIGNANT)
                .map(Utilisateur::getId)
                .orElse(null);
    }
}

