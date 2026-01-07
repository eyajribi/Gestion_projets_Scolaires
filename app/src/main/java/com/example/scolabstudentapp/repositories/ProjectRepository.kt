package com.example.scolabstudentapp.repositories

import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.database.dao.ProjectDao
import com.example.scolabstudentapp.models.Projet
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProjectRepository @Inject constructor(
    private val apiService: ApiService,
    private val projectDao: ProjectDao,
    private val authManager: AuthManager
) {

    val allProjects: Flow<List<Projet>> = projectDao.getAllProjects()

    suspend fun refreshProjects(): Result<Unit> {
        val token = authManager.getAuthHeader()
            ?: return Result.failure(Exception("User not authenticated"))

        return try {
            val response = apiService.getProjetsEtudiant(token)
            if (response.isSuccessful && response.body() != null) {
                projectDao.deleteAll()
                projectDao.insertAll(response.body()!!)
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch projects"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProjectById(projectId: String): Projet? {
        val token = authManager.getAuthHeader()
            ?: return null

        return try {
            val response = apiService.getProjetById(token, projectId)
            response.body()
        } catch (e: Exception) {
            null
        }
    }
}
