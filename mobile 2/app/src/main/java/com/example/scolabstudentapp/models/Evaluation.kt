package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

data class Evaluation(
    @SerializedName("note")
    val note: Double,
    @SerializedName("commentaire")
    val commentaire: String?
)
