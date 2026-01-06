package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Service.NotificationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ==================== PROJET CRÉÉ ====================
    @PostMapping("/projets/creation")
    public ResponseEntity<Map<String, Object>> notifyProjectCreated(@RequestBody ProjectNotificationRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Non authentifié"
            ));
        }

        notificationService.notifyProjectCreated(request.getProjetId(), request.getGroupes());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notifications de création de projet envoyées"
        ));
    }

    // ==================== RAPPEL D'ÉCHÉANCE ====================
    @PostMapping("/projets/echeance")
    public ResponseEntity<Map<String, Object>> notifyProjectDeadline(@RequestBody ProjectDeadlineNotificationRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Non authentifié"
            ));
        }

        notificationService.notifyProjectDeadline(request.getProjetId(), request.getGroupes());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notifications de rappel d'échéance envoyées"
        ));
    }

    // ==================== NOTIFICATION PERSONNALISÉE ====================
    @PostMapping("/custom")
    public ResponseEntity<Map<String, Object>> sendCustomNotification(@RequestBody CustomNotificationRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Non authentifié"
            ));
        }

        notificationService.sendCustomNotification(request.getDestinataires(), request.getTitre(), request.getMessage());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notifications personnalisées envoyées"
        ));
    }

    // ==================== DTOs internes ====================
    @Data
    public static class ProjectNotificationRequest {
        private String projetId;
        private String titre;
        private String dateDebut;
        private String dateFin;
        private List<String> groupes;
    }

    @Data
    public static class ProjectDeadlineNotificationRequest {
        private String projetId;
        private String titre;
        private String dateEcheance;
        private List<String> groupes;
    }

    @Data
    public static class CustomNotificationRequest {
        private List<String> destinataires;
        private String titre;
        private String message;
    }
}

