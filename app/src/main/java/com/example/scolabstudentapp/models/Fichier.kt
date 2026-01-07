// models/Fichier.kt
package com.example.scolabstudentapp.models

data class Fichier(
    val nom: String,
    val url: String,
    val taille: Long,
    val type: String, // Ex: "pdf", "image"
    val dateUpload: String
)