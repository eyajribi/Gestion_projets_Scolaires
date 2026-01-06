package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.Conversation;
import com.Scolab.ScolabBackend.Entity.Message;
import com.Scolab.ScolabBackend.Repository.ConversationRepository;
import com.Scolab.ScolabBackend.Repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessagerieService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public Conversation creerConversation(String groupeId, String enseignantId) {
        Conversation existing = conversationRepository.findByGroupeIdAndEnseignantId(groupeId, enseignantId);
        if (existing != null) return existing;
        Conversation conv = new Conversation();
        conv.setGroupeId(groupeId);
        conv.setEnseignantId(enseignantId);
        conv.setDateCreation(new Date());
        return conversationRepository.save(conv);
    }

    public List<Conversation> getConversationsByGroupe(String groupeId) {
        return conversationRepository.findByGroupeId(groupeId);
    }

    public List<Conversation> getConversationsByEnseignant(String enseignantId) {
        return conversationRepository.findByEnseignantId(enseignantId);
    }

    public Message envoyerMessage(String conversationId, String expediteurId, String expediteurNom, String contenu) {
        Message msg = new Message();
        msg.setConversationId(conversationId);
        msg.setExpediteurId(expediteurId);
        msg.setExpediteurNom(expediteurNom);
        msg.setContenu(contenu);
        msg.setDateEnvoi(new Date());
        msg.setLu(false);
        Message saved = messageRepository.save(msg);
        // Mettre à jour la conversation
        Optional<Conversation> convOpt = conversationRepository.findById(conversationId);
        convOpt.ifPresent(conv -> {
            conv.setDernierMessage(contenu);
            conv.setDateDernierMessage(msg.getDateEnvoi());
            conversationRepository.save(conv);
        });
        return saved;
    }

    public List<Message> getMessagesByConversation(String conversationId) {
        return messageRepository.findByConversationIdOrderByDateEnvoiAsc(conversationId);
    }
}

