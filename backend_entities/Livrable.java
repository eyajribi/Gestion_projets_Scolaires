package com.Scolab.ScolabBackend.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "livrables")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Livrable {
    @Id
    private String id;

    @Field("nom")
    private String nom;

    @Field("description")
    private String description;

    @Field("fichier")
    private Fichier fichier;

    @Field("date_soumission")
    private LocalDateTime dateSoumission;

    @Field("date_echeance")
    private LocalDateTime dateEcheance;

    @DBRef
    @Field("projet")
    private Projet projet;

    @DBRef
    @Field("groupe")
    private Groupe groupe;

    @Field("statut")
    private StatutLivrable statut = StatutLivrable.A_SOUMETTRE;

    @Field("evaluation")
    private Evaluation evaluation;

    @Field("evaluations")
    private List<Evaluation> evaluations = new ArrayList<>();

    public void soumettreFichier(Fichier fichierSoumis) {
        this.fichier = fichierSoumis;
        this.statut = StatutLivrable.SOUMIS;
        this.dateSoumission = LocalDateTime.now();
    }

    public boolean estEnRetard() {
        return LocalDateTime.now().isAfter(dateEcheance) &&
                (statut == StatutLivrable.A_SOUMETTRE || statut == StatutLivrable.SOUMIS);
    }

    public boolean estSoumis() {
        return statut == StatutLivrable.SOUMIS || statut == StatutLivrable.EN_CORRECTION;
    }

    public boolean estCorrige() {
        return statut == StatutLivrable.EN_CORRECTION || statut == StatutLivrable.CORRIGE;
    }

    public void evaluerLivrable(Double note, String commentaires, Enseignant enseignant) {
        Evaluation eval = new Evaluation();
        eval.setNote(note);
        eval.setCommentaires(commentaires);
        eval.setDateEvaluation(LocalDateTime.now());
        eval.setEvaluateur(enseignant);
        this.evaluation = eval;
        this.statut = StatutLivrable.EVALUE;
        // Historique : ajouter à la liste
        if (this.evaluations == null) this.evaluations = new ArrayList<>();
        this.evaluations.add(eval);
    }

    public void mettreEnCorrection() {
        if (this.statut == StatutLivrable.EVALUE) {
            this.statut = StatutLivrable.EN_CORRECTION;
        }
    }

    public void corrigerLivrable() {
        if (this.statut == StatutLivrable.EN_CORRECTION) {
            this.statut = StatutLivrable.CORRIGE;
        }
    }

    public void rejeterSoumission() {
        this.statut = StatutLivrable.REJETE;
        this.fichier = null;
        this.dateSoumission = null;
    }
}
