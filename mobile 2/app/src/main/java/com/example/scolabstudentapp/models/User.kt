package com.example.scolabstudentapp.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.google.gson.annotations.SerializedName

@Entity(tableName = "users")
@TypeConverters(Converters::class)
data class User(
    @PrimaryKey
    @SerializedName("_id")
    val id: String = "",

    @SerializedName("nom")
    val nom: String = "",

    @SerializedName("prenom")
    val prenom: String = "",

    @SerializedName("email")
    val email: String = "",

    @SerializedName("urlPhotoProfil")
    val urlPhotoProfil: String? = null,

    @SerializedName("numTel")
    val numTel: String? = null,

    @SerializedName("nomFac")
    val nomFac: String? = null,

    @SerializedName("nomDep")
    val nomDep: List<String>? = null,

    @SerializedName("role")
    val role: String = "", // "ETUDIANT", "ENSEIGNANT", "ADMIN"

    @SerializedName("estActif")
    val estActif: Boolean = true,

    @SerializedName("emailVerifie")
    val emailVerifie: Boolean = false,
    
    val isLoggedIn: Boolean = false
)
