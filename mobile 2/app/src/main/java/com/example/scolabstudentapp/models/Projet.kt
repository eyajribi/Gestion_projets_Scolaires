package com.example.scolabstudentapp.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.google.gson.annotations.SerializedName
import java.util.Date

@Entity(tableName = "projects")
@TypeConverters(Converters::class)
data class Projet(
    @PrimaryKey
    @SerializedName("id") val id: String,
    @SerializedName("nom") val nom: String,
    @SerializedName("description") val description: String,
    @SerializedName("dateDebut") val dateDebut: Date,
    @SerializedName("dateFin") val dateFin: Date,
    @SerializedName("statut") val statut: StatutProjet,
    // Pour la simplicité de Room, les objets complexes sont ignorés pour l'instant.
    // @SerializedName("enseignant") val enseignant: Enseignant? = null,
    // @SerializedName("groupes") val groupes: List<Groupe> = emptyList(),
    // @SerializedName("taches") val taches: List<Tache> = emptyList(),
    @SerializedName("pourcentageAvancement") val pourcentageAvancement: Double = 0.0,
    @SerializedName("estArchive") val estArchive: Boolean = false
)
