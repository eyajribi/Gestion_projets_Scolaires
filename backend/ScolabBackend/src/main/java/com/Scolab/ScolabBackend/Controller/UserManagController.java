package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Dto.ReqRes;
import com.Scolab.ScolabBackend.Entity.Role;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class UserManagController {
    @Autowired
    private UserManagementService authService;

    // ==================== ADMIN: TOUS LES UTILISATEURS ====================
    @GetMapping("/users")
    public ResponseEntity<ReqRes> getAllUsers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Vérifier si l'utilisateur est admin
        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            ReqRes response = ReqRes.forbidden();
            return ResponseEntity.status(403).body(response);
        }

        ReqRes response = authService.getAllUsers();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ==================== ADMIN: UTILISATEUR PAR ID ====================
    @GetMapping("/users/{id}")
    public ResponseEntity<ReqRes> getUserById(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            ReqRes response = ReqRes.forbidden();
            return ResponseEntity.status(403).body(response);
        }

        try {
            // Récupérer l'utilisateur par ID
            Utilisateur user = authService.getUserById(id);
            if (user != null) {
                ReqRes response = new ReqRes();
                response.setStatus("success");
                response.setStatusCode(200);
                response.setMessage("Utilisateur trouvé");
                response.setUser(user);
                return ResponseEntity.ok(response);
            } else {
                ReqRes response = ReqRes.notFound();
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            ReqRes response = ReqRes.error(500, "Erreur interne: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==================== ADMIN: MODIFIER UTILISATEUR ====================
    @PutMapping("/users/{id}")
    public ResponseEntity<ReqRes> updateUser(@PathVariable String id, @RequestBody ReqRes updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            ReqRes response = ReqRes.forbidden();
            return ResponseEntity.status(403).body(response);
        }

        try {
            // Cette méthode devra être ajoutée à AuthService
            // ReqRes response = authService.updateUser(id, updateRequest);
            // return ResponseEntity.status(response.getStatusCode()).body(response);

            ReqRes response = ReqRes.error(501, "Non implémenté");
            return ResponseEntity.status(501).body(response);
        } catch (Exception e) {
            ReqRes response = ReqRes.error(500, "Erreur interne: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==================== ADMIN: MODIFIER RÔLE ====================
    @PutMapping("/users/{id}/role")
    public ResponseEntity<ReqRes> updateUserRole(@PathVariable String id, @RequestBody ReqRes roleRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            ReqRes response = ReqRes.forbidden();
            return ResponseEntity.status(403).body(response);
        }

        ReqRes response = authService.updateRole(id, roleRequest);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ==================== ADMIN: CRÉER UTILISATEUR ====================
    @PostMapping("/users")
    public ResponseEntity<ReqRes> createUser(@Valid @RequestBody ReqRes registrationRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            ReqRes response = ReqRes.forbidden();
            return ResponseEntity.status(403).body(response);
        }

        ReqRes response = authService.register(registrationRequest);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ==================== ADMIN: SUPPRIMER UTILISATEUR ====================
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ReqRes> deleteUser(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            ReqRes response = ReqRes.forbidden();
            return ResponseEntity.status(403).body(response);
        }

        ReqRes response = authService.deleteUser(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ==================== ADMIN: ACTIVER/DÉSACTIVER COMPTE ====================
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ReqRes> toggleUserStatus(@PathVariable String id, @RequestBody Map<String, Boolean> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            ReqRes response = ReqRes.forbidden();
            return ResponseEntity.status(403).body(response);
        }

        try {
            Boolean isActive = request.get("estActif");
            if (isActive == null) {
                ReqRes response = ReqRes.error("Le champ 'estActif' est requis");
                return ResponseEntity.badRequest().body(response);
            }

            ReqRes response = authService.toggleUserStatus(id, isActive);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            ReqRes response = ReqRes.error(500, "Erreur interne: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==================== RECHERCHER UTILISATEURS ====================
    @GetMapping("/users/search")
    public ResponseEntity<ReqRes> searchUsers(@RequestParam String keyword) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            ReqRes response = ReqRes.forbidden();
            return ResponseEntity.status(403).body(response);
        }

        try {
            // Cette méthode devra être ajoutée à AuthService
            // List<User> users = authService.searchUsers(keyword);
            ReqRes response = new ReqRes();
            response.setStatus("success");
            response.setStatusCode(200);
            response.setMessage("Recherche effectuée");
            // response.setUserList(users);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ReqRes response = ReqRes.error(500, "Erreur lors de la recherche: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==================== UTILISATEURS PAR RÔLE ====================
    @GetMapping("/users/role/{role}")
    public ResponseEntity<ReqRes> getUsersByRole(@PathVariable String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            ReqRes response = ReqRes.forbidden();
            return ResponseEntity.status(403).body(response);
        }

        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            // Cette méthode devra être ajoutée à AuthService
            List<Utilisateur> users = authService.getUsersByRole(userRole);
            ReqRes response = new ReqRes();
            response.setStatus("success");
            response.setStatusCode(200);
            response.setMessage("Utilisateurs par rôle récupérés");
            response.setUserList(users);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ReqRes response = ReqRes.error("Rôle invalide: " + role);
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ReqRes response = ReqRes.error(500, "Erreur interne: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
