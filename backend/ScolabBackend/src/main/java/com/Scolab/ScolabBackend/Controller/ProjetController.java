package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Entity.*;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import com.Scolab.ScolabBackend.Service.ProjetService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projets")
@RequiredArgsConstructor
public class ProjetController {

    private final ProjetService projetService;

    @Autowired
    private UtilisateurRepository  utilisateurRepository;

    @GetMapping("/enseignant")
    public ResponseEntity<List<Projet>> getProjetsEnseignant() {
        try {
            // Récupérer l'authentification depuis SecurityContextHolder
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Collections.emptyList());
            }

            // L'email de l'utilisateur connecté est le principal
            String email = authentication.getName();
            System.out.println("Utilisateur connecté: " + email);

            List<Projet> projets = projetService.getProjetsByEnseignant(email);
            return ResponseEntity.ok(projets);

        } catch (Exception e) {
            System.err.println("Erreur récupération projets enseignant: " + e.getMessage());
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Projet> getProjet(@PathVariable String id) {
        return projetService.getProjetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> creerProjet(@RequestBody Projet projet) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }

            // Récupérer l'email de l'utilisateur connecté
            String email = authentication.getName();
            System.out.println("Utilisateur connecté: " + email);

            Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            System.out.println("ID utilisateur: " + utilisateur.getId());

            // Vérifier que c'est un enseignant
            if (utilisateur.getRole()!= Role.ENSEIGNANT) {
                //System.out.println("**" + utilisateur);
                return ResponseEntity.status(403).body("Seuls les enseignants peuvent créer des projets");
            }

            String enseignantId = utilisateur.getId();
            Projet nouveauProjet = projetService.creerProjet(projet, enseignantId);
            return ResponseEntity.status(201).body(nouveauProjet);

        } catch (Exception e) {
            System.err.println("Erreur création projet: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur lors de la création du projet: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Projet> modifierProjet(@PathVariable String id,
                                                 @RequestBody Projet projet) {
        Projet projetModifie = projetService.modifierProjet(id, projet);
        return ResponseEntity.ok(projetModifie);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> supprimerProjet(@PathVariable String id) {
        projetService.supprimerProjet(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Projet supprimé avec succès");
        response.put("id", id);

        return ResponseEntity.ok(response);
    }
    @PostMapping("/{projetId}/taches")
    public ResponseEntity<Tache> ajouterTache(@PathVariable String projetId,
                                              @RequestBody Tache tache) {
        Tache nouvelleTache = projetService.ajouterTacheAuProjet(projetId, tache);
        return ResponseEntity.ok(nouvelleTache);
    }

    @GetMapping("/retard")
    public ResponseEntity<List<Projet>> getProjetsEnRetard() {
        List<Projet> projetsEnRetard = projetService.getProjetsEnRetard();
        return ResponseEntity.ok(projetsEnRetard);
    }

    @PutMapping("/{projetId}/statut")
    public ResponseEntity<Projet> changerStatutProjet(@PathVariable String projetId,
                                                      @RequestParam StatutProjet statut) {
        Projet projet = projetService.changerStatutProjet(projetId, statut);
        return ResponseEntity.ok(projet);
    }

    @PostMapping("/{projetId}/groupes/{groupeId}")
    public ResponseEntity<Projet> assignerGroupe(@PathVariable String projetId,
                                                 @PathVariable String groupeId) {
        Projet projet = projetService.assignerGroupeAuProjet(projetId, groupeId);
        return ResponseEntity.ok(projet);
    }

    @GetMapping("/{projetId}/taches")
    public ResponseEntity<List<Tache>> getTachesDuProjet(@PathVariable String projetId) {
        List<Tache> taches = projetService.getTachesDuProjet(projetId);
        return ResponseEntity.ok(taches);
    }

    @PutMapping("/{id}/archiver")
    public ResponseEntity<Projet> archiverProjet(@PathVariable String id) {
        Projet projet = projetService.archiverProjet(id);
        return ResponseEntity.ok(projet);
    }

    @PutMapping("/{id}/restaurer")
    public ResponseEntity<Projet> restaurerProjet(@PathVariable String id) {
        Projet projet = projetService.restaurerProjet(id);
        return ResponseEntity.ok(projet);
    }

    @GetMapping("/enseignant/archives")
    public ResponseEntity<List<Projet>> getProjetsArchivesEnseignant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Collections.emptyList());
        }
        String email = authentication.getName();
        List<Projet> projets = projetService.getProjetsArchivesByEnseignant(email);
        return ResponseEntity.ok(projets);
    }
}