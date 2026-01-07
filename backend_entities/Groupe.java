package com.Scolab.ScolabBackend.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
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

    @Field("date_creation")
    private LocalDateTime dateCreation;

    @DBRef
    @Field("enseignant")
    private Utilisateur enseignant;

    @Field("projet")
    private Projet projet;

    @Field("etudiants")
    private List<Etudiant> etudiants = new ArrayList<>();

    public void ajouterEtudiant(Etudiant etudiant) {
        if (this.etudiants == null) {
            this.etudiants = new ArrayList<>();
        }
        this.etudiants.add(etudiant);
    }

    public void supprimerEtudiant(String etudiantId) {
        if (this.etudiants != null) {
            this.etudiants.removeIf(etudiant -> etudiant.getId().equals(etudiantId));
        }
    }
}
