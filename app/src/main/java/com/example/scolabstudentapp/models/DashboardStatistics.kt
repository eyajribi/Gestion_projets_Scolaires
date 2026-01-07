package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

/**
 * Représente les statistiques affichées sur le tableau de bord de l'étudiant.
 */
data class DashboardStatistics(
    @SerializedName("ongoingProjects")
    val ongoingProjects: Int,

    @SerializedName("tasksToDo")
    val tasksToDo: Int
)
