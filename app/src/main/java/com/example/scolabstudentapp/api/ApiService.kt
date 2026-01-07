package com.example.scolabstudentapp.api

import com.example.scolabstudentapp.models.*
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ==================== AUTH ====================
    @POST("/auth/login")
    suspend fun login(@Body request: com.example.scolabstudentapp.models.LoginRequest): Response<com.example.scolabstudentapp.models.ReqRes>

    @POST("/auth/register")
    suspend fun register(@Body request: com.example.scolabstudentapp.models.RegisterRequest): Response<com.example.scolabstudentapp.models.ReqRes>

    @POST("/auth/forgot-password")
    suspend fun forgotPassword(@Body request: com.example.scolabstudentapp.models.ForgotPasswordRequest): Response<com.example.scolabstudentapp.models.ReqRes>

    @POST("/auth/reset-password")
    suspend fun resetPassword(@Body request: com.example.scolabstudentapp.models.ResetPasswordRequest): Response<com.example.scolabstudentapp.models.ReqRes>

    @GET("/auth/profile")
    suspend fun getProfile(@Header("Authorization") token: String): Response<com.example.scolabstudentapp.models.ReqRes>

    @POST("/auth/verify-email")
    suspend fun verifyEmail(@Body request: com.example.scolabstudentapp.models.VerifyEmailRequest): Response<com.example.scolabstudentapp.models.ReqRes>

    // ==================== PROJETS ====================
    @GET("/api/etudiants/projets")
    suspend fun getProjetsEtudiant(@Header("Authorization") token: String): Response<List<Projet>>

    @GET("/api/projets/{id}")
    suspend fun getProjetById(
        @Header("Authorization") token: String,
        @Path("id") projetId: String
    ): Response<Projet>

    // ==================== TÂCHES ====================
    @GET("/api/etudiants/taches")
    suspend fun getMesTaches(@Header("Authorization") token: String): Response<List<Tache>>

    @GET("/api/etudiants/taches")
    suspend fun getTachesTriees(
        @Header("Authorization") token: String,
        @Query("sort") sort: String?
    ): Response<List<Tache>>

    @PUT("/api/etudiants/taches/{tacheId}/statut")
    suspend fun updateStatutTache(
        @Header("Authorization") token: String,
        @Path("tacheId") tacheId: String,
        @Query("statut") statut: String
    ): Response<Tache>

    // ==================== LIVRABLES ====================
    @GET("/api/livrables/mes-livrables")
    suspend fun getMesLivrables(@Header("Authorization") token: String): Response<List<Livrable>>

    @Multipart
    @POST("/api/etudiants/livrables/{livrableId}/soumettre")
    suspend fun soumettreLivrable(
        @Header("Authorization") token: String,
        @Path("livrableId") livrableId: String,
        @Part file: MultipartBody.Part
    ): Response<Any>

    @GET("/api/etudiants/livrables/{livrableId}/commentaires")
    suspend fun getCommentairesLivrable(
        @Header("Authorization") token: String,
        @Path("livrableId") livrableId: String
    ): Response<Any>

    @GET("/api/livrables/{id}")
    suspend fun getLivrable(@Header("Authorization") token: String, @Path("id") id: String): Response<Livrable>

    // ==================== GROUPE ====================
    @GET("/api/groupes/mon-groupe")
    suspend fun getMonGroupe(@Header("Authorization") token: String): Response<Groupe>

    // ==================== ETUDIANT ====================
    @PUT("/api/utilisateurs/etudiants/{id}")
    suspend fun updateEtudiant(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body etudiant: Etudiant
    ): Response<Etudiant>

    @Multipart
    @POST("/api/utilisateurs/me/photo")
    suspend fun uploadProfilePhoto(
        @Header("Authorization") token: String,
        @Part photo: MultipartBody.Part
    ): Response<ReqRes>

    @GET("/api/utilisateurs/etudiants/{id}")
    suspend fun getEtudiantById(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<Etudiant>

    // ==================== NOTIFICATIONS ====================
    @GET("/api/etudiants/notifications")
    suspend fun getNotifications(@Header("Authorization") token: String): Response<List<Any>>

    // ==================== FEEDBACKS ====================
    @GET("/api/feedbacks/mes-feedbacks")
    suspend fun getMyFeedbacks(@Header("Authorization") token: String): Response<List<Feedback>>

    // ==================== CALENDRIER ====================
    @GET("/api/evenements/mes-evenements")
    suspend fun getMyEvents(@Header("Authorization") token: String): Response<List<Any>>

    @GET("/api/evenements/date/{date}")
    suspend fun getEventsForDate(
        @Header("Authorization") token: String,
        @Path("date") date: String
    ): Response<List<Any>>

    @DELETE("/api/utilisateurs/{id}")
    suspend fun deleteUtilisateur(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<Unit>
}
