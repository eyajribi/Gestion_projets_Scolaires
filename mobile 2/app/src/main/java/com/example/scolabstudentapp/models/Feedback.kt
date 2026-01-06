package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

/**
 * Représente un feedback reçu par un étudiant.
 * Le nom des champs correspond à ce qui est attendu de l'API backend.
 */
data class Feedback(
    // L'identifiant unique du feedback, souvent généré par la base de données (ex: MongoDB ObjectId)
    @SerializedName("_id")
    val id: String,

    // Le commentaire textuel laissé dans le feedback.
    @SerializedName("commentaire")
    val commentaire: String,

    // La note attribuée, sur une échelle de 1 à 5 par exemple.
    @SerializedName("note")
    val note: Float,

    // Le nom du projet concerné par le feedback pour donner du contexte.
    @SerializedName("projetNom")
    val projetNom: String,

    // La date à laquelle le feedback a été donné, sous forme de chaîne (ex: format ISO 8601).
    @SerializedName("dateCreation")
    val dateCreation: String,

    // La réponse de l'étudiant à ce feedback. Peut être null s'il n'y a pas encore de réponse.
    @SerializedName("reponse")
    var reponse: String?,

    // La date de la réponse. Peut être null.
    @SerializedName("dateReponse")
    var dateReponse: String?,

    // L'évaluateur qui a donné le feedback.
    @SerializedName("evaluateur")
    val evaluateur: String?
)
