package com.Scolab.ScolabBackend.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "utilisateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {
    @Id
    private String id;

    @Field("nom")
    private String nom;

    @Field("prenom")
    private String prenom;

    @Field("email")
    private String email;

    @Field("mot_de_passe")
    private String password; // Peut être null pour OAuth2

    @Field("numero_telephone")
    private String numTel;

    @Field("photo_profil_url")
    private String urlPhotoProfil;

    @Field("role")
    private Role role;

    @Field("est_actif")
    private boolean estActif = true;

    @Field("nom_faculte")
    private String nomFac;

    @Field("nom_departements")
    private List<String> nomDep;

    // Champs pour OAuth2
    @Field("auth_provider")
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Field("provider_id")
    private String providerId;

    @Field("email_verifie")
    private boolean emailVerifie = false;

    // Timestamps
    @Field("date_creation")
    private LocalDateTime dateCreation;

    @Field("date_modification")
    private LocalDateTime dateModification;

    @Field("derniere_connexion")
    private LocalDateTime derniereConnexion;

    public Utilisateur(String nom, String prenom, String email, Role role, AuthProvider authProvider, String providerId) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.role = role;
        this.authProvider = authProvider;
        this.providerId = providerId;
        this.estActif = true;
        this.emailVerifie = true;
        this.dateCreation = LocalDateTime.now();
    }

    public void seConnecter() {
        this.derniereConnexion = LocalDateTime.now();
    }

    public void modifierProfil(Utilisateur utilisateurModifie) {
        this.nom = utilisateurModifie.getNom();
        this.prenom = utilisateurModifie.getPrenom();
        this.numTel = utilisateurModifie.getNumTel();
        this.urlPhotoProfil = utilisateurModifie.getUrlPhotoProfil();
        this.nomFac = utilisateurModifie.getNomFac();
        this.nomDep = utilisateurModifie.getNomDep();
        this.dateModification = LocalDateTime.now();
    }

    public void activerCompte() {
        this.estActif = true;
    }

    public void desactiverCompte() {
        this.estActif = false;
    }
}
