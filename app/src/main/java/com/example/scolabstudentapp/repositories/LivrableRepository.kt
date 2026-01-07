package com.example.scolabstudentapp.repositories

import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.auth.AuthManager
import okhttp3.MultipartBody
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LivrableRepository @Inject constructor(
    private val apiService: ApiService,
    private val authManager: AuthManager
) {

    suspend fun soumettreLivrable(livrableId: String, file: MultipartBody.Part): Result<Any> {
        val token = authManager.getAuthHeader()
            ?: return Result.failure(Exception("User not authenticated"))

        return try {
            val response = apiService.soumettreLivrable(token, livrableId, file)
            if (response.isSuccessful) {
                Result.success(response.body() ?: "Livrable soumis avec succès")
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to submit livrable"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCommentairesLivrable(livrableId: String): Result<Any> {
        val token = authManager.getAuthHeader()
            ?: return Result.failure(Exception("User not authenticated"))

        return try {
            val response = apiService.getCommentairesLivrable(token, livrableId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch comments"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
