package com.Scolab.ScolabBackend.Entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "notifications")
public class Notification {
    private String id;
    private String titre;
    private String message;
    private String date;
    private boolean lu;
    private String etudiantId;

    public Notification() {}

    public Notification(String id, String titre, String message, String date, boolean lu, String etudiantId) {
        this.id = id;
        this.titre = titre;
        this.message = message;
        this.date = date;
        this.lu = lu;
        this.etudiantId = etudiantId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public boolean isLu() { return lu; }
    public void setLu(boolean lu) { this.lu = lu; }
    public String getEtudiantId() { return etudiantId; }
    public void setEtudiantId(String etudiantId) { this.etudiantId = etudiantId; }
}
