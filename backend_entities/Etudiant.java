package com.Scolab.ScolabBackend.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "etudiants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Etudiant {
    @Id
    private String id;

    @Field("nom")
    private String nom;

    @Field("prenom")
    private String prenom;

    @Field("email")
    private String email;

    @Field("numero_telephone")
    private String numTel;

    @Field("photo_profil_url")
    private String urlPhotoProfil;

    @Field("date_inscription")
    private LocalDateTime dateInscription = LocalDateTime.now();

    @Field("statut")
    private String statut = "ACTIF";

    @Field("groupe_id")
    private String groupeId;

    @DBRef
    @Field("projet_actuel")
    private Projet projetActuel;

    @Field("taches_en_cours")
    private List<Tache> tachesEnCours = new ArrayList<>();

    @Field("livrables_soumis")
    private List<Livrable> livrablesSoumis = new ArrayList<>();

    public Etudiant() {}

    public Etudiant(String nom, String prenom, String email, String numTel) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.numTel = numTel;
        this.dateInscription = LocalDateTime.now();
        this.statut = "ACTIF";
    }

    public String getNomComplet() {
        return prenom + " " + nom;
    }

    public void ajouterTache(Tache tache) {
        if (this.tachesEnCours == null) {
            this.tachesEnCours = new ArrayList<>();
        }
        this.tachesEnCours.add(tache);
    }

    public void soumettreLivrable(Livrable livrable) {
        if (this.livrablesSoumis == null) {
            this.livrablesSoumis = new ArrayList<>();
        }
        this.livrablesSoumis.add(livrable);
    }

    public int getNombreTachesActives() {
        return tachesEnCours != null ? tachesEnCours.size() : 0;
    }

    public int getNombreLivrablesSoumis() {
        return livrablesSoumis != null ? livrablesSoumis.size() : 0;
    }
}
