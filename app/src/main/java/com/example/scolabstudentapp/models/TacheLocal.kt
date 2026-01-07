package com.example.scolabstudentapp.models

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "taches_locales")
data class TacheLocal(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val titre: String,
    val description: String,
    val dateEcheance: String,
    val statut: String = "A_FAIRE",
    val etudiantEmail: String,
    val projetId: Long
)
