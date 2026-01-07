package com.example.scolabstudentapp.api

import com.example.scolabstudentapp.models.Projet
import com.example.scolabstudentapp.models.Tache
import com.example.scolabstudentapp.models.Notification
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface EtudiantApiService {
    
    // 1. Liste des projets de l'étudiant connecté
    @GET("/api/etudiants/projets")
    suspend fun getProjetsEtudiant(): Response<List<com.example.scolabstudentapp.models.Projet>>
    
    // 2. Détails d'un projet
    @GET("/api/etudiants/projets/{id}")
    suspend fun getProjectDetails(@Path("id") projectId: String): Response<com.example.scolabstudentapp.models.Projet>
    
    // 3. Calendrier des projets
    @GET("/api/etudiants/projets/calendrier")
    suspend fun getCalendrier(): Response<List<Map<String, Any>>>
    
    // 4. Liste des tâches triées de l'étudiant connecté
    @GET("/api/etudiants/taches")
    suspend fun getTachesEtudiant(@Query("sort") sort: String?): Response<List<com.example.scolabstudentapp.models.Tache>>
    
    // 5. Déposer un livrable
    @Multipart
    @POST("/api/etudiants/livrables/{livrableId}/soumettre")
    suspend fun soumettreLivrable(
        @Path("livrableId") livrableId: String,
        @Part("fichier") fichier: MultipartBody.Part
    ): Response<Any>
    
    // 6. Voir les commentaires et notes d'un livrable
    @GET("/api/etudiants/livrables/{livrableId}/commentaires")
    suspend fun getCommentairesLivrable(@Path("livrableId") livrableId: String): Response<Any>
    
    // 7. Changer le statut d'une tâche
    @PUT("/api/etudiants/taches/{tacheId}/statut")
    suspend fun changerStatutTache(
        @Path("tacheId") tacheId: String,
        @Query("statut") statut: String
    ): Response<com.example.scolabstudentapp.models.Tache>
    
    // 8. Recevoir les notifications
    @GET("/api/etudiants/notifications")
    suspend fun getNotificationsEtudiant(): Response<List<com.example.scolabstudentapp.models.Notification>>
}
