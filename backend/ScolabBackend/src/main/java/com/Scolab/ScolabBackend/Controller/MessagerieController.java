package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Entity.Conversation;
import com.Scolab.ScolabBackend.Entity.Groupe;
import com.Scolab.ScolabBackend.Entity.Message;
import com.Scolab.ScolabBackend.Service.MessagerieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/messagerie")
@RequiredArgsConstructor
public class MessagerieController {
    private static final Logger logger = LoggerFactory.getLogger(MessagerieController.class);
    private final MessagerieService messagerieService;

    @PostMapping("/conversations")
    public ResponseEntity<?> creerConversation(@RequestParam String groupeId, @RequestParam String enseignantId) {
        try {
            Conversation conv = messagerieService.creerConversation(groupeId, enseignantId);
            if (conv == null) {
                return ResponseEntity.status(404).body("Conversation non trouvée ou erreur de création");
            }
            return ResponseEntity.ok(conv);
        } catch (Exception e) {
            logger.error("Erreur lors de la création de la conversation", e);
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/conversations/groupe/{groupeId}")
    public ResponseEntity<?> getConversationsByGroupe(@PathVariable String groupeId) {
        try {
            List<Conversation> list = messagerieService.getConversationsByGroupe(groupeId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des conversations par groupe", e);
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/conversations/enseignant/{enseignantId}")
    public ResponseEntity<?> getConversationsByEnseignant(@PathVariable String enseignantId) {
        try {
            List<Conversation> list = messagerieService.getConversationsByEnseignant(enseignantId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des conversations par enseignant", e);
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @PostMapping("/messages")
    public ResponseEntity<?> envoyerMessage(@RequestParam String conversationId, @RequestParam String expediteurId, @RequestParam String expediteurNom, @RequestParam String contenu, @RequestParam(required = false) String groupeId, @RequestParam(required = false) String enseignantId) {
        try {
            // Vérification de l'existence de la conversation
            String convId = conversationId;
            if (convId == null || convId.isEmpty()) {
                return ResponseEntity.badRequest().body("conversationId manquant ou vide");
            }
            if (!messagerieService.conversationExists(convId)) {
                // Création automatique si groupeId et enseignantId fournis
                if (groupeId != null && enseignantId != null) {
                    Conversation conv = messagerieService.creerConversation(groupeId, enseignantId);
                    if (conv == null) {
                        return ResponseEntity.status(500).body("Impossible de créer la conversation automatiquement");
                    }
                    convId = conv.getId();
                } else {
                    return ResponseEntity.status(404).body("Conversation non trouvée et informations insuffisantes pour la créer");
                }
            }
            if (contenu == null || contenu.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le contenu du message est vide");
            }
            Message msg = messagerieService.envoyerMessage(convId, expediteurId, expediteurNom, contenu);
            if (msg == null) {
                return ResponseEntity.status(500).body("Message non créé");
            }
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi du message", e);
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<?> getMessagesByConversation(@PathVariable String conversationId) {
        try {
            // Vérification de l'existence de la conversation
            if (conversationId == null || conversationId.isEmpty()) {
                return ResponseEntity.badRequest().body("conversationId manquant ou vide");
            }
            if (!messagerieService.conversationExists(conversationId)) {
                return ResponseEntity.status(404).body("Conversation non trouvée : " + conversationId);
            }
            List<Message> list = messagerieService.getMessagesByConversation(conversationId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des messages de la conversation", e);
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/conversations/user/{userId}")
    public ResponseEntity<?> getConversationsByUser(@PathVariable String userId) {
        try {
            List<Conversation> list = messagerieService.getConversationsByUser(userId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des conversations par utilisateur", e);
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/conversations/groupe/{groupeId}/details")
    public ResponseEntity<?> getGroupeDetails(@PathVariable String groupeId) {
        try {
            Groupe groupe = messagerieService.getGroupeWithMembers(groupeId);
            return ResponseEntity.ok(groupe);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des détails du groupe", e);
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }
}
