package com.Scolab.ScolabBackend.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "projet")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Projet {
    @Id
    private String id;

    @Field("nom")
    private String nom;

    @Field("description")
    private String description;

    @Field("date_debut")
    private LocalDateTime dateDebut;

    @Field("date_fin")
    private LocalDateTime dateFin;

    @Field("statut")
    private StatutProjet statut;

    @Field("pourcentage_avancement")
    private Double pourcentageAvancement = 0.0;

    @Field("date_creation")
    @CreatedDate
    private LocalDateTime dateCreation;

    @DBRef
    @Field("enseignant")
    @JsonIgnore
    private Utilisateur enseignant;

    @Field("archive")
    private Boolean archive = false;

    @Field("date_archivage")
    private LocalDateTime dateArchivage;

    @DBRef
    @Field("groupes")
    @JsonIgnore
    private List<Groupe> groupes = new ArrayList<>();

    @Field("taches")
    private List<Tache> taches = new ArrayList<>();

    // Méthodes métier
    public void calculerAvancement() {
        if (taches == null || taches.isEmpty()) {
            this.pourcentageAvancement = 0.0;
            return;
        }

        long tachesTerminees = taches.stream()
                .filter(tache -> tache.getStatut() == StatutTache.TERMINEE)
                .count();

        this.pourcentageAvancement = (double) tachesTerminees / taches.size() * 100;
    }

    public List<Tache> getTachesEnRetard() {
        LocalDateTime maintenant = LocalDateTime.now();
        return taches.stream()
                .filter(tache -> tache.getDateEcheance().isBefore(maintenant) &&
                        tache.getStatut() != StatutTache.TERMINEE)
                .toList();
    }

    public void ajouterTache(Tache tache) {
        if (this.taches == null) {
            this.taches = new ArrayList<>();
        }
        this.taches.add(tache);
        calculerAvancement();
    }

    public void supprimerTache(String tacheId) {
        if (this.taches != null) {
            this.taches.removeIf(tache -> tache.getId().equals(tacheId));
            calculerAvancement();
        }
    }

    public ProjetStats getStatistiquesProjet() {
        int totalTaches = taches != null ? taches.size() : 0;
        int tachesTerminees = taches != null ? (int) taches.stream().filter(t -> t.getStatut() == StatutTache.TERMINEE).count() : 0;
        int tachesEnRetard = getTachesEnRetard().size();
        double avancement = this.pourcentageAvancement != null ? this.pourcentageAvancement : 0.0;
        return new ProjetStats(totalTaches, tachesTerminees, tachesEnRetard, avancement);
    }

    public static class ProjetStats {
        public int totalTaches;
        public int tachesTerminees;
        public int tachesEnRetard;
        public double avancement;
        public ProjetStats(int totalTaches, int tachesTerminees, int tachesEnRetard, double avancement) {
            this.totalTaches = totalTaches;
            this.tachesTerminees = tachesTerminees;
            this.tachesEnRetard = tachesEnRetard;
            this.avancement = avancement;
        }
    }
}