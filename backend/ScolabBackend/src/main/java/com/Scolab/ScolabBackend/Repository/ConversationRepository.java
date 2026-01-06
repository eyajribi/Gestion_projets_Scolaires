package com.Scolab.ScolabBackend.Repository;

import com.Scolab.ScolabBackend.Entity.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
    Conversation findByGroupeIdAndEnseignantId(String groupeId, String enseignantId);
    List<Conversation> findByEnseignantId(String enseignantId);
    List<Conversation> findByGroupeId(String groupeId);
}
