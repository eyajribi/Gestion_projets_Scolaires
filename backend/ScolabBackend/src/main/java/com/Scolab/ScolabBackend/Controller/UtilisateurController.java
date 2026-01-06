package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Dto.ReqRes;
import com.Scolab.ScolabBackend.Entity.Enseignant;
import com.Scolab.ScolabBackend.Entity.Etudiant;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Service.UserManagementService;
import com.Scolab.ScolabBackend.Service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;
    private final UserManagementService userManagementService;

    @GetMapping("/etudiants")
    public ResponseEntity<List<Etudiant>> getAllEtudiants() {
        List<Etudiant> etudiants = utilisateurService.getAllEtudiants();
        return ResponseEntity.ok(etudiants);
    }

    @GetMapping("/enseignants")
    public ResponseEntity<List<Enseignant>> getAllEnseignants() {
        List<Enseignant> enseignants = utilisateurService.getAllEnseignants();
        return ResponseEntity.ok(enseignants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Utilisateur> getUtilisateurById(@PathVariable String id) {
        return utilisateurService.getUtilisateurById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/etudiants/{id}")
    public ResponseEntity<Etudiant> getEtudiantById(@PathVariable String id) {
        return utilisateurService.getEtudiantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/enseignants/{id}")
    public ResponseEntity<Enseignant> getEnseignantById(@PathVariable String id) {
        return utilisateurService.getEnseignantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/etudiants")
    public ResponseEntity<Etudiant> createEtudiant(@RequestBody Etudiant etudiant) {
        Etudiant nouveauEtudiant = utilisateurService.createEtudiant(etudiant);
        return ResponseEntity.ok(nouveauEtudiant);
    }

    @PostMapping("/enseignants")
    public ResponseEntity<Enseignant> createEnseignant(@RequestBody Enseignant enseignant) {
        Enseignant nouvelEnseignant = utilisateurService.createEnseignant(enseignant);
        return ResponseEntity.ok(nouvelEnseignant);
    }

    @PutMapping("/etudiants/{id}")
    public ResponseEntity<Etudiant> updateEtudiant(@PathVariable String id, @RequestBody Etudiant etudiant) {
        Etudiant etudiantModifie = utilisateurService.updateEtudiant(id, etudiant);
        return ResponseEntity.ok(etudiantModifie);
    }

    @PutMapping("/enseignants/{id}")
    public ResponseEntity<Enseignant> updateEnseignant(@PathVariable String id, @RequestBody Enseignant enseignant) {
        Enseignant enseignantModifie = utilisateurService.updateEnseignant(id, enseignant);
        return ResponseEntity.ok(enseignantModifie);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable String id) {
        utilisateurService.deleteUtilisateur(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable String id) {
        utilisateurService.activateUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateUser(@PathVariable String id) {
        utilisateurService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/photo")
    public ResponseEntity<ReqRes> uploadProfilePhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("photo") MultipartFile photo) {

        String email = userDetails.getUsername();

        ReqRes response = userManagementService.updateProfilePhoto(email, photo);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}