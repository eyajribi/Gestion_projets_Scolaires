package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Entity.Conversation;
import com.Scolab.ScolabBackend.Entity.Groupe;
import com.Scolab.ScolabBackend.Entity.Message;
import com.Scolab.ScolabBackend.Service.MessagerieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messagerie")
@RequiredArgsConstructor
public class MessagerieController {
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
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/conversations/groupe/{groupeId}")
    public ResponseEntity<?> getConversationsByGroupe(@PathVariable String groupeId) {
        try {
            List<Conversation> list = messagerieService.getConversationsByGroupe(groupeId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/conversations/enseignant/{enseignantId}")
    public ResponseEntity<?> getConversationsByEnseignant(@PathVariable String enseignantId) {
        try {
            List<Conversation> list = messagerieService.getConversationsByEnseignant(enseignantId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @PostMapping("/messages")
    public ResponseEntity<?> envoyerMessage(@RequestParam String conversationId, @RequestParam String expediteurId, @RequestParam String expediteurNom, @RequestParam String contenu) {
        try {
            // Vérification de l'existence de la conversation
            if (conversationId == null || conversationId.isEmpty()) {
                return ResponseEntity.badRequest().body("conversationId manquant ou vide");
            }
            if (!messagerieService.conversationExists(conversationId)) {
                return ResponseEntity.status(404).body("Conversation non trouvée : " + conversationId);
            }
            if (contenu == null || contenu.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le contenu du message est vide");
            }
            Message msg = messagerieService.envoyerMessage(conversationId, expediteurId, expediteurNom, contenu);
            if (msg == null) {
                return ResponseEntity.status(500).body("Message non créé");
            }
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<?> getMessagesByConversation(@PathVariable String conversationId) {
        try {
            List<Message> list = messagerieService.getMessagesByConversation(conversationId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/conversations/user/{userId}")
    public ResponseEntity<?> getConversationsByUser(@PathVariable String userId) {
        try {
            List<Conversation> list = messagerieService.getConversationsByUser(userId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/conversations/groupe/{groupeId}/details")
    public ResponseEntity<?> getGroupeDetails(@PathVariable String groupeId) {
        try {
            Groupe groupe = messagerieService.getGroupeWithMembers(groupeId);
            return ResponseEntity.ok(groupe);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }
}
