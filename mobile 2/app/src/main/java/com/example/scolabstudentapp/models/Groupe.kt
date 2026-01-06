// models/Groupe.kt
package com.example.scolabstudentapp.models

data class Groupe(
    val id: String,
    val nom: String,
    val etudiants: List<User>?,
    val projets: List<Projet>?
)