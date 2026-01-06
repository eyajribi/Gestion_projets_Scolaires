package com.Scolab.ScolabBackend.Repository;

import com.Scolab.ScolabBackend.Entity.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByConversationIdOrderByDateEnvoiAsc(String conversationId);
    List<Message> findByConversationIdAndLuFalse(String conversationId);
}

