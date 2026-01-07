package com.example.scolabstudentapp.repositories

import android.net.Uri
import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.models.Livrable
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProjectDetailRepository @Inject constructor(
    private val apiService: ApiService,
    private val authManager: AuthManager
) {
    
    suspend fun submitLivrable(taskId: String, fileUri: Uri): Result<Livrable> {
        return try {
            // Convertir l'URI en fichier
            val file = File(fileUri.path ?: return Result.failure(Exception("Invalid file path")))
            val requestFile = RequestBody.create("multipart/form-data".toMediaTypeOrNull(), file)
            val body = MultipartBody.Part.createFormData("file", file.name, requestFile)
            
            // TODO: Implémenter l'appel API pour soumettre un livrable
            // val response = apiService.submitLivrable(taskId, body)
            
            // Pour l'instant, simuler une réponse réussie
            val livrable = Livrable(
                id = "temp_id",
                nom = file.name,
                description = null,
                dateEcheance = "",
                statut = "SOUMIS",
                fichier = null,
                evaluation = null
            )
            Result.success(livrable)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

