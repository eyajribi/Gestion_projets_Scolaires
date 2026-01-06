package com.example.scolabstudentapp.repositories

import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.models.AuthRequest
import com.example.scolabstudentapp.models.AuthResponse
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val authManager: AuthManager
) {

    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val request = AuthRequest(email = email, password = password)
            val response = apiService.login(request)
            if (response.isSuccessful && response.body() != null) {
                response.body()?.token?.let { authManager.saveToken(it) }
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Unknown login error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(
        nom: String,
        prenom: String,
        email: String,
        password: String,
        numTel: String?,
        nomFac: String?,
        nomDep: String?,
        niveau: String?,
        filiere: String?
    ): Result<AuthResponse> {
        return try {
            val request = AuthRequest(
                nom = nom,
                prenom = prenom,
                email = email,
                password = password,
                role = "ETUDIANT",
                numTel = numTel,
                nomFac = nomFac,
                nomDep = nomDep?.split(",")?.map { it.trim() }?.filter { it.isNotEmpty() },
                niveau = niveau,
                filiere = filiere
            )
            val response = apiService.register(request)
            if (response.isSuccessful && response.body() != null) {
                response.body()?.token?.let { authManager.saveToken(it) }
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Unknown registration error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun forgotPassword(email: String): Result<AuthResponse> {
        return try {
            val request = mapOf("email" to email)
            val response = apiService.forgotPassword(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyEmail(token: String): Result<Unit> {
        return try {
            val response = apiService.verifyEmail(mapOf("token" to token))
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
