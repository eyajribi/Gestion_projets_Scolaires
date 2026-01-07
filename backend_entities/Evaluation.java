package com.Scolab.ScolabBackend.Entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Document(collection = "evaluations")
public class Evaluation {
    @Id
    private String id;

    @Field("note")
    private Double note;

    @Field("commentaires")
    private String commentaires;

    @Field("date_evaluation")
    private LocalDateTime dateEvaluation;

    @Field("evaluateur")
    private Enseignant evaluateur;

    // Méthodes métier
    public boolean estValide() {
        return note != null && note >= 0 && note <= 20;
    }

    public String getAppreciation() {
        if (note == null) return "Non évalué";
        if (note >= 16) return "Très bien";
        if (note >= 14) return "Bien";
        if (note >= 12) return "Assez bien";
        if (note >= 10) return "Passable";
        return "Insuffisant";
    }
}
