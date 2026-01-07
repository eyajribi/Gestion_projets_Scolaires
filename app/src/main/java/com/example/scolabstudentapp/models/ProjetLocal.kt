package com.example.scolabstudentapp.models

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "projets_locaux")
data class ProjetLocal(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val titre: String,
    val description: String,
    val dateDebut: String,
    val dateFin: String,
    val statut: String = "EN_COURS",
    val etudiantEmail: String,
    val groupeId: Long
)
