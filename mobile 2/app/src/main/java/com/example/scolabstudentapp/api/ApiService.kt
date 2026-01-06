package com.example.scolabstudentapp.api

import com.example.scolabstudentapp.models.*
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ==================== AUTH ====================
    @POST("/auth/signin")
    suspend fun login(@Body request: AuthRequest): Response<AuthResponse>

    @POST("/auth/signup")
    suspend fun register(@Body request: AuthRequest): Response<AuthResponse>

    @POST("/auth/forgotPassword")
    suspend fun forgotPassword(@Body request: Map<String, String>): Response<AuthResponse>

    @POST("/auth/resetPassword")
    suspend fun resetPassword(@Body request: Map<String, @JvmSuppressWildcards Any>): Response<AuthResponse>

    @GET("/auth/ourDetails")
    suspend fun getProfile(@Header("Authorization") token: String): Response<AuthResponse>

    @POST("/auth/verify-email")
    suspend fun verifyEmail(@Body request: Map<String, String>): retrofit2.Response<Unit>

    // ==================== PROJETS ====================
    @GET("/api/projets/etudiant")
    suspend fun getProjetsEtudiant(@Header("Authorization") token: String): Response<List<Projet>>

    @GET("/api/projets/{id}")
    suspend fun getProjetById(
        @Header("Authorization") token: String,
        @Path("id") projetId: String
    ): Response<Projet>

    // ==================== TÂCHES ====================
    @GET("/api/taches/etudiant")
    suspend fun getMesTaches(@Header("Authorization") token: String): Response<List<Tache>>

    @GET("/api/taches/projet/{projetId}")
    suspend fun getTachesProjet(
        @Header("Authorization") token: String,
        @Path("projetId") projetId: String
    ): Response<List<Tache>>

    @PUT("/api/taches/{tacheId}/statut")
    suspend fun updateStatutTache(
        @Header("Authorization") token: String,
        @Path("tacheId") tacheId: String,
        @Body body: Map<String, String>
    ): Response<Tache>

    // ==================== LIVRABLES ====================
    @GET("/api/livrables/mes-livrables")
    suspend fun getMesLivrables(@Header("Authorization") token: String): Response<List<Livrable>>

    @Multipart
    @POST("/api/livrables/{livrableId}/soumettre")
    suspend fun soumettreLivrable(
        @Header("Authorization") token: String,
        @Path("livrableId") livrableId: String,
        @Part file: MultipartBody.Part
    ): Response<Livrable>

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

    @DELETE("/api/utilisateurs/{id}")
    suspend fun deleteUtilisateur(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<Unit>
}
