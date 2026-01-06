package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Entity.StatutTache;
import com.Scolab.ScolabBackend.Entity.Tache;
import com.Scolab.ScolabBackend.Service.TacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/taches")
@RequiredArgsConstructor
public class TacheController {

    private final TacheService tacheService;

    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<List<Tache>> getTachesByEtudiant(@PathVariable String etudiantId) {
        List<Tache> taches = tacheService.getTachesByEtudiant(etudiantId);
        return ResponseEntity.ok(taches);
    }

    @GetMapping("/retard")
    public ResponseEntity<List<Tache>> getTachesEnRetard() {
        List<Tache> tachesEnRetard = tacheService.getTachesEnRetard();
        return ResponseEntity.ok(tachesEnRetard);
    }

    @PutMapping("/{tacheId}/assigner/{etudiantId}")
    public ResponseEntity<Tache> assignerTacheAEtudiant(
            @PathVariable String tacheId,
            @PathVariable String etudiantId) {
        Tache tache = tacheService.assignerTacheAEtudiant(tacheId, etudiantId);
        return ResponseEntity.ok(tache);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tache> updateTache(
            @PathVariable String id,
            @RequestBody Tache tache) {
        Tache tacheModifiee = tacheService.updateTache(id, tache);
        return ResponseEntity.ok(tacheModifiee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTache(@PathVariable String id) {
        tacheService.deleteTache(id);
        return ResponseEntity.ok().build();
    }

    // Endpoints supplémentaires pour une gestion complète
    @GetMapping("/{id}")
    public ResponseEntity<Tache> getTacheById(@PathVariable String id) {
        return tacheService.getTacheById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Tache> creerTache(@RequestBody Tache tache) {
        if (tache.getProjetId() == null) {
            throw new RuntimeException("Le champ projetId est obligatoire !");
        }
        Tache nouvelleTache = tacheService.creerTache(tache);
        return ResponseEntity.ok(nouvelleTache);
    }

    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<Tache>> getTachesByProjet(@PathVariable String projetId) {
        List<Tache> taches = tacheService.getTachesByProjet(projetId);
        System.out.println("\uD83D\uDCC1 [DEBUG] Tâches du projet " + projetId + ":");
        for (Tache t : taches) {
            System.out.println("  - Tâche: " + t);
        }
        return ResponseEntity.ok(taches);
    }

    @GetMapping("/projet/terminee/{projetId}")
    public ResponseEntity<List<Tache>> getTachesTermineByProjet(@PathVariable String projetId) {
        List<Tache> taches = tacheService.getTachesByProjet(projetId)
                .stream()
                .filter(Tache::isTerminee)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taches);
    }

    @PutMapping("/{tacheId}/statut")
    public ResponseEntity<Tache> changerStatutTache(
            @PathVariable String tacheId,
            @RequestParam StatutTache statut) {
        Tache tache = tacheService.changerStatutTache(tacheId, statut);
        return ResponseEntity.ok(tache);
    }

    @PutMapping("/{tacheId}/retirer/{etudiantId}")
    public ResponseEntity<Tache> retirerEtudiantDeTache(
            @PathVariable String tacheId,
            @PathVariable String etudiantId) {
        Tache tache = tacheService.retirerEtudiantDeTache(tacheId, etudiantId);
        return ResponseEntity.ok(tache);
    }

    @GetMapping("/projet/{projetId}/statut/{statut}")
    public ResponseEntity<List<Tache>> getTachesByProjetAndStatut(
            @PathVariable String projetId,
            @PathVariable StatutTache statut) {
        List<Tache> taches = tacheService.getTachesByProjetAndStatut(projetId, statut);
        return ResponseEntity.ok(taches);
    }
}