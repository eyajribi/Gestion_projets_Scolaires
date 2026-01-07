package com.example.scolabstudentapp.models

import java.util.Date

data class CalendarEvent(
    val id: String,
    val titre: String,
    val description: String?,
    val dateDebut: Date,
    val dateFin: Date,
    val type: String, // "DEVOIR", "EXAMEN", "RENDU", etc.
    val projetId: String?,
    val couleur: String? = null // Pour la couleur dans le calendrier
)
