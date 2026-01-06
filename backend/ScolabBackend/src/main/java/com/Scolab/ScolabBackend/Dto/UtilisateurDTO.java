package com.Scolab.ScolabBackend.Dto;

import java.util.List;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import org.springframework.security.core.GrantedAuthority;
import java.util.stream.Collectors;

public class UtilisateurDTO {
    private String id;
    private String nom;
    private String prenom;
    private String email;
    private List<String> roles;
    // Ajoutez d'autres champs utiles si besoin

    public UtilisateurDTO(Utilisateur user) {
        this.id = user.getId();
        this.nom = user.getNom();
        this.prenom = user.getPrenom();
        this.email = user.getEmail();
        // Conversion des authorities en String
        if (user.getAuthorities() != null) {
            this.roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        }
    }

    // Getters et setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
