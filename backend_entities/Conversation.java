package com.Scolab.ScolabBackend.Entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "conversations")
public class Conversation {
    @Id
    private String id;
    
    // Un groupe et un enseignant
    private String groupeId;
    private String enseignantId;
    
    // Date de création
    private LocalDateTime dateCreation = LocalDateTime.now();
    
    // Dernier message (pour affichage rapide)
    private String dernierMessage;
    private LocalDateTime dateDernierMessage;
}
