package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Service.EtudiantService;
import com.Scolab.ScolabBackend.Entity.Projet;
import com.Scolab.ScolabBackend.Entity.Tache;
import com.Scolab.ScolabBackend.Entity.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/etudiants")
public class EtudiantController {
    @Autowired
    private EtudiantService etudiantService;

    // 1. Liste des projets
    @GetMapping("/projets")
    public ResponseEntity<List<Projet>> getProjets() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Collections.emptyList());
        }
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.getProjets(email));
    }

    // 3. Liste des tâches triées
    @GetMapping("/taches")
    public ResponseEntity<List<Tache>> getTaches(@RequestParam(required = false) String sort) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Collections.emptyList());
        }
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.getTaches(email, sort));
    }

    // 4. Déposer un livrable
    @PostMapping("/livrables/{livrableId}/soumettre")
    public ResponseEntity<?> soumettreLivrable(@PathVariable String livrableId,
        @RequestParam("fichier") MultipartFile fichier) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Non authentifié");
        }
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.soumettreLivrable(email, livrableId, fichier));
    }

    // 5. Voir les commentaires et notes
    @GetMapping("/livrables/{livrableId}/commentaires")
    public ResponseEntity<?> getCommentairesLivrable(@PathVariable String livrableId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Non authentifié");
        }
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.getCommentairesLivrable(email, livrableId));
    }

    // 6. Marquer tâche faite
    @PutMapping("/taches/{tacheId}/statut")
    public ResponseEntity<Tache> changerStatutTache(@PathVariable String tacheId,
        @RequestParam String statut) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(null);
        }
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.changerStatutTache(email, tacheId, statut));
    }

    // 7. Recevoir les notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Collections.emptyList());
        }
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.getNotifications(email));
    }
}
