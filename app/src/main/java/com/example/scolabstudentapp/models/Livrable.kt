package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

data class Livrable(
    @SerializedName("_id")
    val id: String,
    @SerializedName("nom")
    val nom: String,
    @SerializedName("description")
    val description: String?,
    @SerializedName("dateEcheance")
    val dateEcheance: String,
    @SerializedName("statut")
    val statut: String, // Ex: "A_SOUMETTRE", "SOUMIS"
    @SerializedName("fichier")
    val fichier: Fichier?,
    @SerializedName("evaluation")
    val evaluation: Evaluation?
)
