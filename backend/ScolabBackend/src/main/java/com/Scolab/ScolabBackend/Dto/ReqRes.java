package com.Scolab.ScolabBackend.Dto;

import com.Scolab.ScolabBackend.Entity.Role;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReqRes {

    // ==================== CHAMPS POUR TOUTES LES REQUÊTES ====================

    // Champs d'authentification
    private String email;
    private String password;
    private String currentPassword; // Ajouté pour changePassword
    private String newPassword;

    // Champs de profil utilisateur
    private String nom;
    private String prenom;
    private String numTel;
    private String nomFac;
    private List<String> nomDep;
    private Role role;
    private String urlPhotoProfil; // URL de la photo de profil

    // Champs de token JWT
    private String token;
    private String refreshToken;
    private String expirationTime;

    // Champs de réponse
    private String status; // success/error
    private int statusCode; // Code HTTP
    private String message; // Message de succès
    private String error; // Message d'erreur

    // Données utilisateur
    private Utilisateur user;
    private List<Utilisateur> userList;

    // Champs temporels
    private LocalDateTime dateCreation;
    private LocalDateTime derniereConnexion;

    // Champs pour opérations spécifiques
    private String id; // Pour les opérations par ID
    private String newRole; // Pour changement de rôle
    private Boolean estActif; // Pour activation/désactivation

    // ==================== CONSTRUCTEURS ====================

    public ReqRes() {}

    public ReqRes(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public ReqRes(String status, int statusCode, String message) {
        this.status = status;
        this.statusCode = statusCode;
        this.message = message;
    }

    // ==================== MÉTHODES STATIQUES POUR RÉPONSES RAPIDES ====================

    public static ReqRes success(String message) {
        return new ReqRes("success", 200, message);
    }

    public static ReqRes error(String message) {
        return new ReqRes("error", 400, message);
    }

    public static ReqRes error(int statusCode, String message) {
        return new ReqRes("error", statusCode, message);
    }

    public static ReqRes unauthorized() {
        return new ReqRes("error", 401, "Non autorisé");
    }

    public static ReqRes forbidden() {
        return new ReqRes("error", 403, "Accès refusé");
    }

    public static ReqRes notFound() {
        return new ReqRes("error", 404, "Ressource non trouvée");
    }

    // ==================== GETTERS ET SETTERS ====================

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getNumTel() {
        return numTel;
    }

    public void setNumTel(String numTel) {
        this.numTel = numTel;
    }

    public String getNomFac() {
        return nomFac;
    }

    public void setNomFac(String nomFac) {
        this.nomFac = nomFac;
    }

    public List<String> getNomDep() {
        return nomDep;
    }
    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }


    public void setNomDep(List<String> nomDep) {
        this.nomDep = nomDep;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getExpirationTime() {
        return expirationTime;
    }

    public void setExpirationTime(String expirationTime) {
        this.expirationTime = expirationTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public Utilisateur getUser() {
        return user;
    }

    public void setUser(Utilisateur user) {
        this.user = user;
    }

    public List<Utilisateur> getUserList() {
        return userList;
    }

    public void setUserList(List<Utilisateur> userList) {
        this.userList = userList;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDerniereConnexion() {
        return derniereConnexion;
    }

    public void setDerniereConnexion(LocalDateTime derniereConnexion) {
        this.derniereConnexion = derniereConnexion;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNewRole() {
        return newRole;
    }

    public void setNewRole(String newRole) {
        this.newRole = newRole;
    }

    public Boolean getEstActif() {
        return estActif;
    }

    public void setEstActif(Boolean estActif) {
        this.estActif = estActif;
    }

    public String getUrlPhotoProfil() {
        return urlPhotoProfil;
    }

    public void setUrlPhotoProfil(String urlPhotoProfil) {
        this.urlPhotoProfil = urlPhotoProfil;
    }
}