package com.example.scolabstudentapp.models

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "etudiants")
data class Etudiant(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val email: String,
    val nom: String,
    val prenom: String,
    val numTel: String? = null,
    val urlPhotoProfil: String? = null,
    val nomFac: String? = null,
    val nomDep: List<String> = emptyList(),
    val niveau: String? = null,
    val filiere: String? = null,
    val groupeId: Long? = null,
    val estActif: Boolean = true,
    val emailVerifie: Boolean = false,
    val isLoggedIn: Boolean = false
)
