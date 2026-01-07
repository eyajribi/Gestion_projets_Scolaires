package com.example.scolabstudentapp.api

import com.example.scolabstudentapp.models.ReqRes
import retrofit2.Response
import retrofit2.http.*

interface AuthService {
    
    // ==================== INSCRIPTION ====================
    @POST("/auth/register")
    suspend fun register(@Body req: ReqRes): Response<ReqRes>
    
    // ==================== CONNEXION ====================
    @POST("/auth/login")
    suspend fun login(@Body req: ReqRes): Response<ReqRes>
    
    // ==================== RAFRAÎCHIR TOKEN ====================
    @POST("/auth/refresh")
    suspend fun refreshToken(@Body req: ReqRes): Response<ReqRes>
    
    // ==================== PROFIL UTILISATEUR ====================
    @GET("/auth/profile")
    suspend fun getProfile(): Response<ReqRes>
    
    // ==================== MODIFIER PROFIL ====================
    @PUT("/auth/profile/update")
    suspend fun updateProfile(@Body updateRequest: ReqRes): Response<ReqRes>
    
    // ==================== VÉRIFIER TOKEN ====================
    @POST("/auth/verify-token")
    suspend fun verifyToken(@Body request: Map<String, String>): Response<Map<String, Any>>
    
    // ==================== DÉCONNEXION ====================
    @POST("/auth/logout")
    suspend fun logout(): Response<ReqRes>
    
    // ==================== VÉRIFIER EMAIL ====================
    @POST("/auth/verify-email")
    suspend fun verifyEmail(@Body request: Map<String, String>): Response<ReqRes>
    
    // ==================== RENVOYER EMAIL DE VÉRIFICATION ====================
    @POST("/auth/resend-verification")
    suspend fun resendVerification(@Body request: Map<String, String>): Response<ReqRes>
    
    // ==================== DEMANDE RÉINITIALISATION MOT DE PASSE ====================
    @POST("/auth/forgot-password")
    suspend fun forgotPassword(@Body request: Map<String, String>): Response<ReqRes>
    
    // ==================== RÉINITIALISER MOT DE PASSE ====================
    @POST("/auth/reset-password")
    suspend fun resetPassword(@Body resetRequest: ReqRes): Response<ReqRes>
    
    // ==================== CHANGER MOT DE PASSE ====================
    @PUT("/auth/change-password")
    suspend fun changePassword(@Body passwordRequest: ReqRes): Response<ReqRes>
    
    // ==================== SUCCÈS OAUTH2 ====================
    @GET("/auth/oauth2/success")
    suspend fun oauth2Success(@Query("token") token: String): Response<ReqRes>
}
