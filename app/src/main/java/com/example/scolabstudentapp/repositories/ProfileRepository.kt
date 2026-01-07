package com.example.scolabstudentapp.repositories

import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.models.AuthResponse
import com.example.scolabstudentapp.models.User
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProfileRepository @Inject constructor(
    private val apiService: ApiService,
    private val authManager: AuthManager
) {

    suspend fun getUserProfile(): Result<AuthResponse> {
        val token = authManager.getAuthHeader()
            ?: return Result.failure(Exception("User not authenticated"))

        return try {
            val response = apiService.getProfile(token)
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.status == "success") {
                    val user = User(
                        id = "profile_id",
                        email = "profile@example.com",
                        nom = "Profile",
                        prenom = "User",
                        role = "ETUDIANT"
                    )
                    Result.success(AuthResponse(token = token, user = user))
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Profile fetch failed"))
                }
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateUserProfile(
        nom: String,
        prenom: String,
        numTel: String,
        fac: String,
        dep: String,
        niveau: String,
        filiere: String
    ): Result<User> {
        val token = authManager.getAuthHeader()
            ?: return Result.failure(Exception("User not authenticated"))
        // Remplacer "testId" par la vraie méthode d'obtention de l'ID utilisateur dès que possible
        val userId = 1L // Utiliser Long au lieu de String
        return try {
            val etudiant = com.example.scolabstudentapp.models.Etudiant(
                id = userId,
                nom = nom,
                prenom = prenom,
                email = "", // à compléter avec l'email courant
                numTel = numTel,
                urlPhotoProfil = null,
                nomFac = fac,
                nomDep = dep.split(",").map { it.trim() },
                niveau = niveau,
                filiere = filiere,
                estActif = true
            )
            val response = apiService.updateEtudiant(token, userId.toString(), etudiant)
            if (response.isSuccessful && response.body() != null) {
                val updatedEtudiant = response.body()!!
                Result.success(
                    com.example.scolabstudentapp.models.User(
                        id = userId.toString(),
                        nom = updatedEtudiant.nom,
                        prenom = updatedEtudiant.prenom,
                        email = updatedEtudiant.email,
                        numTel = updatedEtudiant.numTel,
                        urlPhotoProfil = updatedEtudiant.urlPhotoProfil,
                        nomFac = updatedEtudiant.nomFac,
                        nomDep = updatedEtudiant.nomDep,
                        role = "ETUDIANT",
                        estActif = updatedEtudiant.estActif ?: true,
                        emailVerifie = false,
                        isLoggedIn = true
                    )
                )
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to update profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
