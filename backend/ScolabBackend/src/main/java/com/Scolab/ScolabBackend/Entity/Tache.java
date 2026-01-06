package com.Scolab.ScolabBackend.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "taches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tache {
    @Id
    private String id;

    @Field("titre")
    private String titre;

    @Field("description")
    private String description;

    @Field("priorite")
    private Priorite priorite = Priorite.MOYENNE;

    @Field("statut")
    private StatutTache statut = StatutTache.A_FAIRE;

    @Field("date_debut")
    private LocalDateTime dateDebut;

    @Field("date_echeance")
    private LocalDateTime dateEcheance;

    @Field("date_fin")
    private LocalDateTime dateFin;

    @DBRef
    @Field("assignes_a")
    private List<Etudiant> assignesA;

    @Field("projet_id")
    private String projetId;

    @DBRef
    @Field("livrable_associe")
    private Livrable livrableAssocie;

    // Méthodes métier
    public boolean estEnRetard() {
        return LocalDateTime.now().isAfter(dateEcheance) && statut != StatutTache.TERMINEE;
    }

    public boolean isTerminee() {
        return statut == StatutTache.TERMINEE;
    }

    public void changerStatut(StatutTache nouveauStatut) {
        this.statut = nouveauStatut;
        if (nouveauStatut == StatutTache.TERMINEE) {
            this.dateFin = LocalDateTime.now();
        }
    }
}