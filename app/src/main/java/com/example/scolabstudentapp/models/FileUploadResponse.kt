package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

/**
 * Représente la réponse du serveur après l'upload d'un fichier.
 */
data class FileUploadResponse(
    @SerializedName("fileUrl")
    val fileUrl: String,

    @SerializedName("message")
    val message: String
)
