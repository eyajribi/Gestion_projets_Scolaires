package com.Scolab.ScolabBackend.Entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    private String conversationId;
    private String expediteurId; // userId (étudiant ou enseignant)
    private String expediteurNom;
    private String contenu;
    private LocalDateTime dateEnvoi = LocalDateTime.now();
    private boolean lu = false;
    private String etudiantId;

    public Message() {}

    public Message(String id, String titre, String message, String date, boolean lu, String etudiantId) {
        this.id = id;
        this.conversationId = id; // Pour simplifier, on peut utiliser le même ID
        this.expediteurNom = titre;
        this.contenu = message;
        this.dateEnvoi = LocalDateTime.parse(date);
        this.lu = lu;
        this.etudiantId = etudiantId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitre() { return expediteurNom; }
    public void setTitre(String titre) { this.expediteurNom = titre; }
    public String getMessage() { return contenu; }
    public void setMessage(String message) { this.contenu = message; }
    public String getDate() { return dateEnvoi.toString(); }
    public void setDate(String date) { this.dateEnvoi = LocalDateTime.parse(date); }
    public boolean isLu() { return lu; }
    public void setLu(boolean lu) { this.lu = lu; }
    public String getEtudiantId() { return etudiantId; }
    public void setEtudiantId(String etudiantId) { this.etudiantId = etudiantId; }
}
