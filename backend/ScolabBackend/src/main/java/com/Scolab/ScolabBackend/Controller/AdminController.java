package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Entity.Role;
import com.Scolab.ScolabBackend.Service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UtilisateurService utilisateurService;

    // CRUD utilisateurs (tous rôles)
    @GetMapping("/utilisateurs")
    public ResponseEntity<List<Utilisateur>> getAllUtilisateurs() {
        return ResponseEntity.ok(utilisateurService.getAllUtilisateurs());
    }

    @GetMapping("/utilisateurs/{id}")
    public ResponseEntity<Utilisateur> getUtilisateur(@PathVariable String id) {
        return utilisateurService.getUtilisateurById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/utilisateurs")
    public ResponseEntity<Utilisateur> createUtilisateur(@RequestBody Utilisateur utilisateur) {
        return ResponseEntity.ok(utilisateurService.createUtilisateur(utilisateur));
    }

    @PutMapping("/utilisateurs/{id}")
    public ResponseEntity<Utilisateur> updateUtilisateur(@PathVariable String id, @RequestBody Utilisateur utilisateur) {
        return ResponseEntity.ok(utilisateurService.updateUtilisateur(id, utilisateur));
    }

    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable String id) {
        utilisateurService.deleteUtilisateur(id);
        return ResponseEntity.ok().build();
    }

    // Gestion des rôles
    @PutMapping("/utilisateurs/{id}/role")
    public ResponseEntity<Utilisateur> updateRole(@PathVariable String id, @RequestBody Role role) {
        return ResponseEntity.ok(utilisateurService.updateRole(id, role));
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
}
