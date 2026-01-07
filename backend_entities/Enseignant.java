package com.Scolab.ScolabBackend.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "enseignants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enseignant {
    @Id
    private String id;

    @Field("nom")
    private String nom;

    @Field("prenom")
    private String prenom;

    @Field("email")
    private String email;

    @Field("specialite")
    private String specialite;

    @Field("grade")
    private String grade;

    @Field("date_embauche")
    private LocalDateTime dateEmbauche;

    @Field("statut")
    private boolean statut = true;

    @Field("departements")
    private List<String> departements = new ArrayList<>();

    public Enseignant() {}

    public Enseignant(String nom, String prenom, String email, String specialite, String grade) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.specialite = specialite;
        this.grade = grade;
        this.dateEmbauche = LocalDateTime.now();
        this.statut = true;
    }

    public void ajouterDepartement(String departement) {
        if (this.departements == null) {
            this.departements = new ArrayList<>();
        }
        this.departements.add(departement);
    }

    public String getNomComplet() {
        return prenom + " " + nom;
    }
}
