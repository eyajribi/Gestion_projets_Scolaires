package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Entity.Etudiant;
import com.Scolab.ScolabBackend.Entity.Groupe;
import com.Scolab.ScolabBackend.Entity.Projet;
import com.Scolab.ScolabBackend.Service.GroupeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groupes")
@RequiredArgsConstructor
public class GroupeController {
        private final GroupeService groupeService;

        @GetMapping
        public ResponseEntity<List<Groupe>> getAllGroupes() {
            try {
                List<Groupe> groupes = groupeService.getAllGroupes();
                return ResponseEntity.ok(groupes);
            } catch (Exception e) {
                System.err.println("❌ Erreur getAllGroupes: " + e.getMessage());
                return ResponseEntity.status(500).build();
            }
        }

        @GetMapping("/{id}")
        public ResponseEntity<Groupe> getGroupeById(@PathVariable String id) {
            try {
                return groupeService.getGroupeById(id)
                        .map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
            } catch (Exception e) {
                System.err.println("❌ Erreur getGroupeById: " + e.getMessage());
                return ResponseEntity.status(500).build();
            }
        }

        @PostMapping
        public ResponseEntity<Groupe> createGroupe(@RequestBody Groupe groupe) {
            try {
                Groupe nouveauGroupe = groupeService.createGroupe(groupe);
                return ResponseEntity.status(201).body(nouveauGroupe);
            } catch (Exception e) {
                System.err.println("❌ Erreur createGroupe: " + e.getMessage());
                return ResponseEntity.status(500).build();
            }
        }

        @PutMapping("/{id}")
        public ResponseEntity<Groupe> updateGroupe(@PathVariable String id,
                                                   @RequestBody Groupe groupeDetails) {
            try {
                Groupe groupeMaj = groupeService.updateGroupe(id, groupeDetails);
                return ResponseEntity.ok(groupeMaj);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("non trouvé")) {
                    return ResponseEntity.notFound().build();
                }
                System.err.println("❌ Erreur updateGroupe: " + e.getMessage());
                return ResponseEntity.status(500).build();
            }
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Map<String, String>> deleteGroupe(@PathVariable String id) {
            try {
                groupeService.deleteGroupe(id);
                Map<String, String> response = Map.of(
                        "message", "Groupe supprimé avec succès",
                        "id", id
                );
                return ResponseEntity.ok(response);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("non trouvé")) {
                    return ResponseEntity.notFound().build();
                }
                System.err.println("❌ Erreur deleteGroupe: " + e.getMessage());
                return ResponseEntity.status(500).build();
            }
        }

        @PostMapping("/{groupeId}/etudiants/{etudiantId}")
        public ResponseEntity<Groupe> ajouterEtudiantAuGroupe(@PathVariable String groupeId,
                                                              @PathVariable String etudiantId) {
            try {
                Groupe groupeMaj = groupeService.ajouterEtudiantAuGroupe(groupeId, etudiantId);
                return ResponseEntity.ok(groupeMaj);
            } catch (RuntimeException e) {
                System.err.println("❌ Erreur ajouterEtudiantAuGroupe: " + e.getMessage());
                return ResponseEntity.status(400).body(null);
            }
        }

        @DeleteMapping("/{groupeId}/etudiants/{etudiantId}")
        public ResponseEntity<Groupe> retirerEtudiantDuGroupe(@PathVariable String groupeId,
                                                              @PathVariable String etudiantId) {
            try {
                Groupe groupeMaj = groupeService.retirerEtudiantDuGroupe(groupeId, etudiantId);
                return ResponseEntity.ok(groupeMaj);
            } catch (RuntimeException e) {
                System.err.println("❌ Erreur retirerEtudiantDuGroupe: " + e.getMessage());
                return ResponseEntity.status(400).body(null);
            }
        }

        @PostMapping("/{groupeId}/projets/{projetId}")
        public ResponseEntity<Groupe> ajouterProjetAuGroupe(@PathVariable String groupeId,
                                                            @PathVariable String projetId) {
            try {
                Groupe groupeMaj = groupeService.ajouterProjetAuGroupe(groupeId, projetId);
                return ResponseEntity.ok(groupeMaj);
            } catch (RuntimeException e) {
                System.err.println("❌ Erreur ajouterProjetAuGroupe: " + e.getMessage());
                return ResponseEntity.status(400).body(null);
            }
        }

        @GetMapping("/{groupeId}/etudiants")
        public ResponseEntity<List<Etudiant>> getEtudiantsByGroupe(@PathVariable String groupeId) {
            try {
                List<Etudiant> etudiants = groupeService.getEtudiantsByGroupe(groupeId);
                return ResponseEntity.ok(etudiants);
            } catch (RuntimeException e) {
                System.err.println("❌ Erreur getEtudiantsByGroupe: " + e.getMessage());
                return ResponseEntity.status(400).build();
            }
        }

        @GetMapping("/{groupeId}/projets")
        public ResponseEntity<List<Projet>> getProjetsByGroupe(@PathVariable String groupeId) {
            try {
                List<Projet> projets = groupeService.getProjetsByGroupe(groupeId);
                return ResponseEntity.ok(projets);
            } catch (RuntimeException e) {
                System.err.println("❌ Erreur getProjetsByGroupe: " + e.getMessage());
                return ResponseEntity.status(400).build();
            }
        }

        @PostMapping("/{groupeId}/calcul-avancement")
        public ResponseEntity<Groupe> calculerAvancementGroupe(@PathVariable String groupeId) {
            try {
                Groupe groupeMaj = groupeService.calculerAvancementGroupe(groupeId);
                return ResponseEntity.ok(groupeMaj);
            } catch (RuntimeException e) {
                System.err.println("❌ Erreur calculerAvancementGroupe: " + e.getMessage());
                return ResponseEntity.status(400).body(null);
            }
        }

}