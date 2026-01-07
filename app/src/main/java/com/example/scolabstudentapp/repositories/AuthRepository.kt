package com.example.scolabstudentapp.repositories

import android.util.Log
import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.models.AuthRequest
import com.example.scolabstudentapp.models.AuthResponse
import com.example.scolabstudentapp.models.User
import com.example.scolabstudentapp.repositories.EtudiantRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val authManager: AuthManager,
    private val etudiantRepository: EtudiantRepository
) {

    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            Log.d("AuthRepository", "Tentative de login pour: $email")
            
            // MODE LOCAL DIRECT - Créer un compte local immédiatement
            val etudiant = etudiantRepository.loginEtudiant(email)
            
            // Créer un token local
            val token = "local_token_${System.currentTimeMillis()}"
            
            val user = com.example.scolabstudentapp.models.User(
                id = email,
                email = email,
                nom = if (email == "eyajribi8@gmail.com") "RIBI" else "Demo",
                prenom = if (email == "eyajribi8@gmail.com") "Youssef" else "User",
                role = "ETUDIANT"
            )
            
            authManager.saveToken(token)
            authManager.saveCurrentUser(user)
            
            Log.d("AuthRepository", "Login LOCAL réussi pour: $email")
            Result.success(AuthResponse(token = token, user = user))
            
        } catch (e: Exception) {
            Log.e("AuthRepository", "Login exception", e)
            Result.failure(e)
        }
    }
    
    private suspend fun createLocalAccount(email: String): Result<AuthResponse> {
        Log.d("AuthRepository", "Creating local account for: $email")
        
        try {
            // Créer l'étudiant dans la base locale
            etudiantRepository.loginEtudiant(email)
            
            // Créer un token local
            val token = "local_token_${System.currentTimeMillis()}"
            
            val user = com.example.scolabstudentapp.models.User(
                id = email,
                email = email,
                nom = if (email == "eyajribi8@gmail.com") "RIBI" else "Demo",
                prenom = if (email == "eyajribi8@gmail.com") "Youssef" else "User",
                role = "ETUDIANT"
            )
            
            authManager.saveToken(token)
            authManager.saveCurrentUser(user)
            
            Log.d("AuthRepository", "Local account created successfully for: $email")
            return Result.success(AuthResponse(token = token, user = user))
            
        } catch (e: Exception) {
            Log.e("AuthRepository", "Failed to create local account: ${e.message}")
            return Result.failure(e)
        }
    }

    suspend fun register(
        nom: String,
        prenom: String,
        email: String,
        password: String,
        numTel: String?,
        nomFac: String?,
        niveau: String?,
        filiere: String?
    ): Result<AuthResponse> {
        return try {
            // MODE DÉMO pour tester sans backend
            if (email == "demo@scolab.com") {
                Log.d("AuthRepository", "Mode DÉMO - Inscription réussie")
                val token = "demo_token_${System.currentTimeMillis()}"
                val user = com.example.scolabstudentapp.models.User(
                    id = "demo_user",
                    email = email,
                    nom = nom,
                    prenom = prenom,
                    role = "ETUDIANT"
                )
                
                authManager.saveToken(token)
                authManager.saveCurrentUser(user)
                Log.d("AuthRepository", "Register DÉMO réussi pour: $email")
                return Result.success(AuthResponse(token = token, user = user))
            }
            
            // MODE PRODUCTION
            val request = com.example.scolabstudentapp.models.RegisterRequest(
                nom = nom,
                prenom = prenom,
                email = email,
                password = password,
                role = "ETUDIANT",
                numTel = numTel,
                nomFac = nomFac,
                nomDep = null, // Ajouté pour correspondre au DTO
                niveau = niveau,
                filiere = filiere
            )
            val response = apiService.register(request)
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.status == "success") {
                    val token = apiResponse.token ?: ""
                    val user = com.example.scolabstudentapp.models.User(
                        id = "new_user_id",
                        email = email,
                        nom = nom,
                        prenom = prenom,
                        role = "ETUDIANT"
                    )
                    authManager.saveToken(token)
                    authManager.saveCurrentUser(user)
                    Result.success(AuthResponse(token = token, user = user))
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Registration failed"))
                }
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Network error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun forgotPassword(email: String): Result<AuthResponse> {
        return try {
            val request = com.example.scolabstudentapp.models.ForgotPasswordRequest(email = email)
            val response = apiService.forgotPassword(request)
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.status == "success") {
                    Result.success(AuthResponse(token = "", user = com.example.scolabstudentapp.models.User(
                        id = "", email = email, nom = "", prenom = "", role = ""
                    )))
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Forgot password failed"))
                }
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Network error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyEmail(token: String): Result<Unit> {
        return try {
            val request = com.example.scolabstudentapp.models.VerifyEmailRequest(token = token)
            val response = apiService.verifyEmail(request)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Erreur de vérification"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
