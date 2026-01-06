package com.example.scolabstudentapp.models

data class Etudiant(
    val id: String? = null,
    val nom: String,
    val prenom: String,
    val email: String,
    val numTel: String?,
    val urlPhotoProfil: String? = null,
    val nomFac: String?,
    val nomDep: List<String>?,
    val niveau: String?,
    val filiere: String?,
    val estActif: Boolean? = true
)
