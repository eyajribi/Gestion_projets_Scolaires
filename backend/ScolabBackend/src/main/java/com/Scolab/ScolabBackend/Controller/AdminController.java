package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Entity.Role;
import com.Scolab.ScolabBackend.Service.UtilisateurService;
import com.Scolab.ScolabBackend.Service.ProjetService;
import com.Scolab.ScolabBackend.Entity.Projet;
import com.Scolab.ScolabBackend.Dto.UtilisateurDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UtilisateurService utilisateurService;
    private final ProjetService projetService;

    // CRUD utilisateurs (tous rôles)
    @GetMapping("/utilisateurs")
    public ResponseEntity<List<UtilisateurDTO>> getAllUtilisateurs() {
        List<Utilisateur> users = utilisateurService.getAllUtilisateurs();
        List<UtilisateurDTO> dtos = users.stream().map(UtilisateurDTO::new).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/utilisateurs/{id}")
    public ResponseEntity<UtilisateurDTO> getUtilisateur(@PathVariable String id) {
        return utilisateurService.getUtilisateurById(id)
                .map(user -> ResponseEntity.ok(new UtilisateurDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/utilisateurs")
    public ResponseEntity<UtilisateurDTO> createUtilisateur(@RequestBody Utilisateur utilisateur) {
        Utilisateur created = utilisateurService.createUtilisateur(utilisateur);
        return ResponseEntity.ok(new UtilisateurDTO(created));
    }

    @PutMapping("/utilisateurs/{id}")
    public ResponseEntity<UtilisateurDTO> updateUtilisateur(@PathVariable String id, @RequestBody Utilisateur utilisateur) {
        Utilisateur updated = utilisateurService.updateUtilisateur(id, utilisateur);
        return ResponseEntity.ok(new UtilisateurDTO(updated));
    }

    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable String id) {
        utilisateurService.deleteUtilisateur(id);
        return ResponseEntity.ok().build();
    }

    // Gestion des rôles
    @PutMapping("/utilisateurs/{id}/role")
    public ResponseEntity<UtilisateurDTO> updateRole(@PathVariable String id, @RequestBody Role role) {
        Utilisateur updated = utilisateurService.updateRole(id, role);
        return ResponseEntity.ok(new UtilisateurDTO(updated));
    }

    // Dashboard admin (statistiques)
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(utilisateurService.getDashboardStats());
    }

    // Logs système (stub, à compléter)
    @GetMapping("/logs")
    public ResponseEntity<List<String>> getSystemLogs() {
        // À implémenter : lecture des logs système
        return ResponseEntity.ok(List.of("Log système non implémenté"));
    }

    // Statistiques détaillées de tous les projets
    @GetMapping("/projets/stats")
    public ResponseEntity<List<Projet.ProjetStats>> getStatsTousProjets() {
        return ResponseEntity.ok(projetService.getStatistiquesTousProjets());
    }

    // Statistiques détaillées des projets d'un enseignant
    @GetMapping("/projets/stats/{enseignantId}")
    public ResponseEntity<List<Projet.ProjetStats>> getStatsProjetsParEnseignant(@PathVariable String enseignantId) {
        return ResponseEntity.ok(projetService.getStatistiquesProjetsParEnseignant(enseignantId));
    }
}
