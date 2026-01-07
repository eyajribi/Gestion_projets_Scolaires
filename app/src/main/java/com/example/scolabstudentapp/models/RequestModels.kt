package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("email")
    val email: String,
    
    @SerializedName("password")
    val password: String
)

data class RegisterRequest(
    @SerializedName("nom")
    val nom: String,
    
    @SerializedName("prenom")
    val prenom: String,
    
    @SerializedName("email")
    val email: String,
    
    @SerializedName("password")
    val password: String,
    
    @SerializedName("role")
    val role: String = "ETUDIANT",
    
    @SerializedName("numTel")
    val numTel: String? = null,
    
    @SerializedName("nomFac")
    val nomFac: String? = null,
    
    @SerializedName("nomDep")
    val nomDep: String? = null,
    
    @SerializedName("niveau")
    val niveau: String? = null,
    
    @SerializedName("filiere")
    val filiere: String? = null
)

data class ForgotPasswordRequest(
    @SerializedName("email")
    val email: String
)

data class ResetPasswordRequest(
    @SerializedName("token")
    val token: String,
    
    @SerializedName("newPassword")
    val newPassword: String
)

data class VerifyEmailRequest(
    @SerializedName("token")
    val token: String
)
