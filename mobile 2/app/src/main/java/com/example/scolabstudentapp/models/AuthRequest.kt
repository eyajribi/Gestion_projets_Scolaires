package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

data class AuthRequest(
    @SerializedName("email")
    val email: String,
    @SerializedName("password")
    val password: String? = null,
    @SerializedName("nom")
    val nom: String? = null,
    @SerializedName("prenom")
    val prenom: String? = null,
    @SerializedName("role")
    val role: String? = null,
    @SerializedName("numTel")
    val numTel: String? = null,
    @SerializedName("nomFac")
    val nomFac: String? = null,
    @SerializedName("nomDep")
    val nomDep: List<String>? = null,
    @SerializedName("niveau")
    val niveau: String? = null,
    @SerializedName("filiere")
    val filiere: String? = null
)
