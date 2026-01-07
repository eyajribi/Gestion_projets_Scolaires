package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

data class Commentaire(
    @SerializedName("id")
    val id: String = "",
    
    @SerializedName("contenu")
    val contenu: String = "",
    
    @SerializedName("auteur")
    val auteur: String = "",
    
    @SerializedName("note")
    val note: Float? = null,
    
    @SerializedName("dateCreation")
    val dateCreation: String = "",
    
    @SerializedName("livrableId")
    val livrableId: String = ""
)
