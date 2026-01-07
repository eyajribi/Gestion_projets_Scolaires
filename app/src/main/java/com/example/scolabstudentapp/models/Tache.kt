package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

data class Tache(
    @SerializedName("_id")
    val id: String,
    @SerializedName("titre")
    val titre: String,
    @SerializedName("description")
    val description: String?,
    @SerializedName("dateEcheance")
    val dateEcheance: String,
    @SerializedName("statut")
    val statut: String, // Ex: "A_FAIRE", "EN_COURS"
    @SerializedName("priorite")
    val priorite: String,
    @SerializedName("projetId")
    val projetId: String,
    @SerializedName("assignesA")
    val assignesA: List<User>? = null
)
