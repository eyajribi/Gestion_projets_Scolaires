package com.example.scolabstudentapp.repositories

import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.auth.AuthManager
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationRepository @Inject constructor(
    private val apiService: ApiService,
    private val authManager: AuthManager
) {

    suspend fun getNotifications(): Result<List<Any>> {
        val token = authManager.getAuthHeader()
            ?: return Result.failure(Exception("User not authenticated"))

        return try {
            val response = apiService.getNotifications(token)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch notifications"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
