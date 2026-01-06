package com.Scolab.ScolabBackend.Controller;

import com.Scolab.ScolabBackend.Entity.Conversation;
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
    public ResponseEntity<Conversation> creerConversation(@RequestParam String groupeId, @RequestParam String enseignantId) {
        return ResponseEntity.ok(messagerieService.creerConversation(groupeId, enseignantId));
    }

    @GetMapping("/conversations/groupe/{groupeId}")
    public ResponseEntity<List<Conversation>> getConversationsByGroupe(@PathVariable String groupeId) {
        return ResponseEntity.ok(messagerieService.getConversationsByGroupe(groupeId));
    }

    @GetMapping("/conversations/enseignant/{enseignantId}")
    public ResponseEntity<List<Conversation>> getConversationsByEnseignant(@PathVariable String enseignantId) {
        return ResponseEntity.ok(messagerieService.getConversationsByEnseignant(enseignantId));
    }

    @PostMapping("/messages")
    public ResponseEntity<Message> envoyerMessage(@RequestParam String conversationId, @RequestParam String expediteurId, @RequestParam String expediteurNom, @RequestParam String contenu) {
        return ResponseEntity.ok(messagerieService.envoyerMessage(conversationId, expediteurId, expediteurNom, contenu));
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<Message>> getMessagesByConversation(@PathVariable String conversationId) {
        return ResponseEntity.ok(messagerieService.getMessagesByConversation(conversationId));
    }
}

