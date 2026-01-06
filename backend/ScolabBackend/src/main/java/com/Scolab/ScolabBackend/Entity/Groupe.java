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

@Document(collection = "groupes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Groupe {
    @Id
    private String id;

    @Field("nom")
    private String nom;

    @Field("description")
    private String description;

    @Field("pourcentage_avancement")
    private Double pourcentageAvancement = 0.0;

    @Field("date_creation")
    private LocalDateTime dateCreation;

    @Field("archive")
    private Boolean archive;

    @DBRef
    @Field("etudiants")
    private List<Etudiant> etudiants = new ArrayList<>();

    @DBRef
    @Field("projets")
    private List<Projet> projets = new ArrayList<>();

    // Méthodes métier
    public void calculerAvancementGroupe() {
        if (projets == null || projets.isEmpty()) {
            this.pourcentageAvancement = 0.0;
            return;
        }

        double totalAvancement = projets.stream()
                .mapToDouble(Projet::getPourcentageAvancement)
                .average()
                .orElse(0.0);

        this.pourcentageAvancement = totalAvancement;
    }

    public void ajouterEtudiant(Etudiant etudiant) {
        if (this.etudiants == null) {
            this.etudiants = new ArrayList<>();
        }
        this.etudiants.add(etudiant);
    }

    public void retirerEtudiant(Etudiant etudiant) {
        if (this.etudiants != null) {
            this.etudiants.remove(etudiant);
        }
    }
}