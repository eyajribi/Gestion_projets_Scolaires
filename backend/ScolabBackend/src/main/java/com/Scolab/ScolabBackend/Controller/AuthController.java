package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Dto.ReqRes;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import com.Scolab.ScolabBackend.Repository.VerificationTokenRepository;
import com.Scolab.ScolabBackend.Service.EmailService;
import com.Scolab.ScolabBackend.Service.JWTUtils;
import com.Scolab.ScolabBackend.Service.UserManagementService;
import com.Scolab.ScolabBackend.Service.VerificationTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserManagementService authService;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private VerificationTokenService verificationTokenService;

    @Autowired
    private UtilisateurRepository  userRepository;

    @Autowired
    private EmailService  emailService;

    // ==================== INSCRIPTION ====================
    @PostMapping("/register")
    public ResponseEntity<ReqRes> register(@RequestBody ReqRes req) {
        try {
            ReqRes response = authService.register(req);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            ReqRes errorResponse = ReqRes.error(500, "Erreur interne du serveur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ==================== CONNEXION ====================
    @PostMapping("/login")
    public ResponseEntity<ReqRes> login(@Valid @RequestBody ReqRes req) {
        ReqRes response = authService.login(req);
        return ResponseEntity.status(response.getStatusCode() > 0 ? response.getStatusCode() : 200).body(response);
    }

    // ==================== RAFRAÎCHIR TOKEN ====================
    @PostMapping("/refresh")
    public ResponseEntity<ReqRes> refreshToken(@RequestBody ReqRes req) {
        ReqRes response = authService.refreshToken(req);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ==================== PROFIL UTILISATEUR ====================
    @GetMapping("/profile")
    public ResponseEntity<ReqRes> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        ReqRes response = authService.getMyInfo(email);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ==================== MODIFIER PROFIL ====================
    @PutMapping("/profile/update")
    public ResponseEntity<ReqRes> updateProfile(@Valid @RequestBody ReqRes updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        ReqRes response = authService.updateProfile(email, updateRequest);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ==================== SUCCÈS OAUTH2 ====================
    @GetMapping("/oauth2/success")
    public ResponseEntity<ReqRes> oauth2Success(@RequestParam String token) {
        try {
            String email = jwtUtils.extractUsername(token);
            ReqRes response = authService.getMyInfo(email);

            if ("success".equals(response.getStatus())) {
                response.setToken(token);
                response.setMessage("Connexion OAuth2 réussie");
                return ResponseEntity.ok(response);
            } else {
                ReqRes errorResponse = ReqRes.error("Erreur OAuth2");
                return ResponseEntity.badRequest().body(errorResponse);
            }
        } catch (Exception e) {
            ReqRes response = ReqRes.error("Erreur OAuth2: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== VÉRIFIER TOKEN ====================
    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");

        try {
            String username = jwtUtils.extractUsername(token);
            boolean isValid = jwtUtils.validateToken(token);

            Map<String, Object> response = new HashMap<>();
            response.put("status", isValid ? "valid" : "invalid");
            response.put("user", username);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("status", "invalid", "error", e.getMessage()));
        }
    }

    // ==================== DÉCONNEXION ====================
    @PostMapping("/logout")
    public ResponseEntity<ReqRes> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Récupérer le token de l'header Authorization
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                String username = jwtUtils.extractUsername(token);
            }
            SecurityContextHolder.clearContext();
            ReqRes logoutResponse = ReqRes.success("Déconnexion réussie");
            return ResponseEntity.ok(logoutResponse);

        } catch (Exception e) {
            ReqRes logoutResponse = ReqRes.success("Déconnexion traitée");
            return ResponseEntity.ok(logoutResponse);
        }
    }

    // ==================== VÉRIFIER EMAIL ====================
    @PostMapping("/verify-email")
    public ResponseEntity<ReqRes> verifyEmail(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            ReqRes response = verificationTokenService.verifyEmail(token);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            ReqRes errorResponse = ReqRes.error(500, "Erreur interne du serveur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ==================== RENVOYER EMAIL DE VÉRIFICATION ====================
    @PostMapping("/resend-verification")
    public ResponseEntity<ReqRes> resendVerification(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newToken = verificationTokenService.resendVerificationToken(email);

            // Récupérer l'utilisateur pour envoyer l'email
            Optional<Utilisateur> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                Utilisateur user = userOptional.get();
                emailService.sendVerificationEmail(user.getEmail(), newToken, user.getNom(), user.getPrenom());

                ReqRes response = ReqRes.success("Email de vérification renvoyé avec succès");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(404).body(ReqRes.error("Utilisateur non trouvé"));
            }
        } catch (Exception e) {
            ReqRes errorResponse = ReqRes.error(500, "Erreur interne du serveur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ==================== DEMANDE RÉINITIALISATION MOT DE PASSE ====================
    @PostMapping("/forgot-password")
    public ResponseEntity<ReqRes> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            ReqRes response = authService.forgotPassword(email);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            ReqRes errorResponse = ReqRes.error(500, "Erreur interne du serveur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ==================== RÉINITIALISER MOT DE PASSE ====================
    @PostMapping("/reset-password")
    public ResponseEntity<ReqRes> resetPassword(@RequestBody ReqRes resetRequest) {
        try {
            ReqRes response = authService.resetPassword(resetRequest);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            ReqRes errorResponse = ReqRes.error(500, "Erreur interne du serveur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ==================== CHANGER MOT DE PASSE (UTILISATEUR CONNECTÉ) ====================
    @PutMapping("/change-password")
    public ResponseEntity<ReqRes> changePassword(@RequestBody ReqRes passwordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            ReqRes response = authService.changePassword(email, passwordRequest);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            ReqRes response = ReqRes.error(500, "Erreur interne: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}