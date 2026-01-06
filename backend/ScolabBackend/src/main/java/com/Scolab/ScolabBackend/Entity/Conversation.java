package com.Scolab.ScolabBackend.Entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Date;

@Data
@Document(collection = "conversations")
public class Conversation {
    @Id
    private String id;
    // Un groupe et un enseignant
    private String groupeId;
    private String enseignantId;
    // Date de création
    private Date dateCreation = new Date();
    // Dernier message (pour affichage rapide)
    private String dernierMessage;
    private Date dateDernierMessage;
}

