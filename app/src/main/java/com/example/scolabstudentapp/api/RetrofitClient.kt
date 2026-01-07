package com.example.scolabstudentapp.api

import android.content.Context
import android.content.SharedPreferences
import com.example.scolabstudentapp.auth.AuthManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    // URL par défaut - peut être modifiée pour les tests
    private var BASE_URL = "http://10.0.2.2:8080/" // Pour l'émulateur Android
    private const val PRODUCTION_URL = "http://localhost:8080/" // Pour le développement local
    private const val ALTERNATIVE_URL = "http://192.168.1.100:8080/" // Pour réseau local
    
    init {
        println("DEBUG: RetrofitClient initialisé avec BASE_URL: $BASE_URL")
        println("DEBUG: URLs alternatives disponibles:")
        println("  - Émulateur: $BASE_URL")
        println("  - Local: $PRODUCTION_URL")
        println("  - Réseau: $ALTERNATIVE_URL")
    }
    
    // Permet de changer l'URL du backend dynamiquement
    fun setBaseUrl(url: String) {
        BASE_URL = url
        println("DEBUG: BASE_URL changé pour: $BASE_URL")
        // Invalider le Retrofit existant pour forcer la recréation
        retrofit = null
    }
    
    // Obtenir l'URL actuelle
    fun getCurrentBaseUrl(): String = BASE_URL

    private lateinit var sharedPreferences: SharedPreferences
    private var retrofit: Retrofit? = null

    private var authManager: AuthManager? = null

    private var apiService: ApiService? = null
    private var etudiantApiService: EtudiantApiService? = null
    private var authService: AuthService? = null

    fun setAuthManager(manager: AuthManager) {
        authManager = manager
    }

    fun initialize(context: Context) {
        sharedPreferences = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
    }

    private fun getRetrofitInstance(): Retrofit {
        if (retrofit == null) {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .addInterceptor { chain ->
                    val originalRequest = chain.request()
                    val token = authManager?.getToken()
                    println("DEBUG RetrofitClient: Token utilisé pour Authorization: $token")
                    val newRequest = originalRequest.newBuilder()
                        .header("Content-Type", "application/json")
                        .apply {
                            if (!token.isNullOrEmpty()) {
                                header("Authorization", "Bearer $token")
                            }
                        }
                        .build()

                    chain.proceed(newRequest)
                }
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()

            retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        return retrofit!!
    }

    fun getApiService(): ApiService {
        if (apiService == null) {
            apiService = getRetrofitInstance().create(ApiService::class.java)
        }
        return apiService!!
    }

    fun getEtudiantApiService(): EtudiantApiService {
        if (etudiantApiService == null) {
            etudiantApiService = getRetrofitInstance().create(EtudiantApiService::class.java)
        }
        return etudiantApiService!!
    }

    fun getAuthService(): AuthService {
        if (authService == null) {
            authService = getRetrofitInstance().create(AuthService::class.java)
        }
        return authService!!
    }

    fun getToken(): String? {
        return authManager?.getToken()
    }

    fun saveToken(token: String?) {
        if (token != null) authManager?.saveToken(token)
    }

    fun clearTokens() {
        authManager?.clearToken()
    }

    private fun getAuthHeader(): String? {
        return authManager?.getAuthHeader()
    }

    // Méthodes pour accéder aux endpoints avec authentification correcte
    suspend fun getMyProjects() = getApiService().getProjetsEtudiant(getAuthHeader() ?: "")
    suspend fun getMyTasks() = getApiService().getMesTaches(getAuthHeader() ?: "")
    suspend fun getMyTasksSorted(sort: String?) = getApiService().getTachesTriees(getAuthHeader() ?: "", sort)
    suspend fun updateTaskStatus(taskId: String, status: String) = getApiService().updateStatutTache(getAuthHeader() ?: "", taskId, status)
    suspend fun submitLivrable(livrableId: String, file: okhttp3.MultipartBody.Part) = getApiService().soumettreLivrable(getAuthHeader() ?: "", livrableId, file)
    suspend fun getLivrableComments(livrableId: String) = getApiService().getCommentairesLivrable(getAuthHeader() ?: "", livrableId)
    suspend fun getNotifications() = getApiService().getNotifications(getAuthHeader() ?: "")
    suspend fun getMyFeedbacks() = getApiService().getMyFeedbacks(getAuthHeader() ?: "")
    suspend fun getMyEvents() = getApiService().getMyEvents(getAuthHeader() ?: "")
    suspend fun getEventsForDate(date: String) = getApiService().getEventsForDate(getAuthHeader() ?: "", date)

    // Nouveaux endpoints du backend
    suspend fun register(req: com.example.scolabstudentapp.models.ReqRes) = getAuthService().register(req)
    suspend fun login(req: com.example.scolabstudentapp.models.ReqRes) = getAuthService().login(req)
    suspend fun refreshToken(req: com.example.scolabstudentapp.models.ReqRes) = getAuthService().refreshToken(req)
    suspend fun getAuthProfile() = getAuthService().getProfile()
    suspend fun updateProfile(updateRequest: com.example.scolabstudentapp.models.ReqRes) = getAuthService().updateProfile(updateRequest)
    suspend fun verifyToken(request: Map<String, String>) = getAuthService().verifyToken(request)
    suspend fun logout() = getAuthService().logout()
    suspend fun verifyEmail(request: Map<String, String>) = getAuthService().verifyEmail(request)
    suspend fun resendVerification(request: Map<String, String>) = getAuthService().resendVerification(request)
    suspend fun forgotPassword(request: Map<String, String>) = getAuthService().forgotPassword(request)
    suspend fun resetPassword(resetRequest: com.example.scolabstudentapp.models.ReqRes) = getAuthService().resetPassword(resetRequest)
    suspend fun changePassword(passwordRequest: com.example.scolabstudentapp.models.ReqRes) = getAuthService().changePassword(passwordRequest)
    suspend fun oauth2Success(token: String) = getAuthService().oauth2Success(token)

    // Endpoints étudiants
    suspend fun getEtudiantProjets() = getEtudiantApiService().getProjetsEtudiant()
    suspend fun getProjectDetails(projectId: String): retrofit2.Response<com.example.scolabstudentapp.models.Projet> {
        return getEtudiantApiService().getProjectDetails(projectId)
    }
    
    suspend fun getEtudiantCalendrier() = getEtudiantApiService().getCalendrier()
    suspend fun getEtudiantTaches(sort: String? = null) = getEtudiantApiService().getTachesEtudiant(sort)
    suspend fun soumettreEtudiantLivrable(livrableId: String, file: okhttp3.MultipartBody.Part) = getEtudiantApiService().soumettreLivrable(livrableId, file)
    suspend fun getEtudiantLivrableComments(livrableId: String) = getEtudiantApiService().getCommentairesLivrable(livrableId)
    suspend fun changerEtudiantTacheStatut(tacheId: String, statut: String) = getEtudiantApiService().changerStatutTache(tacheId, statut)
    suspend fun getEtudiantNotifications() = getEtudiantApiService().getNotificationsEtudiant()
    suspend fun getEtudiantLivrablesByProjet(projetId: String) = getEtudiantApiService().getLivrablesByProjet(projetId)
    suspend fun getEtudiantLivrablesByGroupe(groupeId: String) = getEtudiantApiService().getLivrablesByGroupe(groupeId)
    suspend fun getEtudiantLivrableDetail(livrableId: String) = getEtudiantApiService().getLivrable(livrableId)
}