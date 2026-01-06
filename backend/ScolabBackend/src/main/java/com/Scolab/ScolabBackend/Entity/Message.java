package com.Scolab.ScolabBackend.Entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    private String conversationId;
    private String expediteurId; // userId (étudiant ou enseignant)
    private String expediteurNom;
    private String contenu;
    private Date dateEnvoi = new Date();
    private boolean lu = false;
}

