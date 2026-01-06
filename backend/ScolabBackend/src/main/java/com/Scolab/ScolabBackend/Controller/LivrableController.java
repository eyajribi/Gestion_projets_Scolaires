package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Entity.Livrable;
import com.Scolab.ScolabBackend.Service.LivrableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/livrables")
@RequiredArgsConstructor
public class LivrableController {

    private final LivrableService livrableService;

    @PostMapping("/{livrableId}/soumettre")
    public ResponseEntity<?> soumettreLivrable(
            @PathVariable String livrableId,
            @RequestParam("fichier") MultipartFile fichier,
            @AuthenticationPrincipal String groupeId) {

        try {
            Livrable livrable = livrableService.soumettreLivrable(livrableId, fichier, groupeId);
            return ResponseEntity.ok(livrable);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload du fichier");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{livrableId}/evaluer")
    public ResponseEntity<?> evaluerLivrable(
            @PathVariable String livrableId,
            @RequestParam Double note,
            @RequestParam String commentaires) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
                return ResponseEntity.status(401).body("Non authentifié");
            }
            String email = authentication.getName();
            // Vérification que l'utilisateur est bien un enseignant
            String enseignantId = livrableService.getEnseignantIdByEmail(email);
            if (enseignantId == null) {
                return ResponseEntity.status(403).body("Utilisateur non autorisé : enseignant introuvable");
            }
            Livrable livrable = livrableService.evaluerLivrable(livrableId, note, commentaires, enseignantId);
            return ResponseEntity.ok(livrable);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{livrableId}/correction")
    public ResponseEntity<Livrable> mettreEnCorrection(
            @PathVariable String livrableId,
            @AuthenticationPrincipal String enseignantId) {

        Livrable livrable = livrableService.mettreEnCorrection(livrableId, enseignantId);
        return ResponseEntity.ok(livrable);
    }

    @PutMapping("/{livrableId}/rejeter")
    public ResponseEntity<Livrable> rejeterSoumission(
            @PathVariable String livrableId,
            @AuthenticationPrincipal String enseignantId) {

        Livrable livrable = livrableService.rejeterSoumission(livrableId, enseignantId);
        return ResponseEntity.ok(livrable);
    }

    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<Livrable>> getLivrablesByProjet(@PathVariable String projetId) {
        List<Livrable> livrables = livrableService.getLivrablesByProjet(projetId);
        return ResponseEntity.ok(livrables);
    }

    @GetMapping("/groupe/{groupeId}")
    public ResponseEntity<List<Livrable>> getLivrablesByGroupe(@PathVariable String groupeId) {
        List<Livrable> livrables = livrableService.getLivrablesByGroupe(groupeId);
        return ResponseEntity.ok(livrables);
    }

    @GetMapping("/retard")
    public ResponseEntity<List<Livrable>> getLivrablesEnRetard() {
        List<Livrable> livrables = livrableService.getLivrablesEnRetard();
        return ResponseEntity.ok(livrables);
    }

    @GetMapping("/enseignant")
    public ResponseEntity<List<Livrable>> getLivrablesByEnseignant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Collections.emptyList());
        }

        // L'email de l'utilisateur connecté est le principal
        String email = authentication.getName();
        System.out.println("Utilisateur connecté: " + email);
        List<Livrable> livrables = livrableService.getLivrablesByEnseignant(email);
        return ResponseEntity.ok(livrables);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livrable> getLivrable(@PathVariable String id) {
        return livrableService.getLivrableById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}