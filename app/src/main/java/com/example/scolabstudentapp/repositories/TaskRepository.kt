package com.example.scolabstudentapp.repositories

import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.models.Tache
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TaskRepository @Inject constructor(
    private val apiService: ApiService,
    private val authManager: AuthManager
) {

    suspend fun getTasks(): Result<List<Tache>> {
        val token = authManager.getAuthHeader()
            ?: return Result.failure(Exception("User not authenticated"))

        return try {
            val response = apiService.getMesTaches(token)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch tasks"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTasksSorted(sort: String?): Result<List<Tache>> {
        val token = authManager.getAuthHeader()
            ?: return Result.failure(Exception("User not authenticated"))

        return try {
            val response = apiService.getTachesTriees(token, sort)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch tasks"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateTaskStatus(taskId: String, status: String): Result<Tache> {
        val token = authManager.getAuthHeader()
            ?: return Result.failure(Exception("User not authenticated"))

        return try {
            val response = apiService.updateStatutTache(token, taskId, status)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to update task status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
