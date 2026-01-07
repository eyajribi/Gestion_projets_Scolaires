package com.example.scolabstudentapp.api

import android.content.Context
import android.content.SharedPreferences
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
                    val token = getToken()

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

    val apiService: ApiService by lazy {
        getRetrofitInstance().create(ApiService::class.java)
    }
    
    val etudiantApiService: EtudiantApiService by lazy {
        getRetrofitInstance().create(EtudiantApiService::class.java)
    }
    
    val authService: AuthService by lazy {
        getRetrofitInstance().create(AuthService::class.java)
    }

    // Gestion des tokens
    fun saveToken(token: String?) {
        if (::sharedPreferences.isInitialized) {
            sharedPreferences.edit().putString("user_token", token).apply()
            println("DEBUG: Token sauvegardé: ${token?.take(20)}...")
        } else {
            println("DEBUG: SharedPreferences non initialisé, impossible de sauvegarder le token")
        }
    }

    fun getToken(): String? {
        return if (::sharedPreferences.isInitialized) {
            val token = sharedPreferences.getString("user_token", null)
            println("DEBUG: Token récupéré: ${token?.take(20)}...")
            token
        } else {
            println("DEBUG: SharedPreferences non initialisé, aucun token disponible")
            null
        }
    }

    fun clearTokens() {
        if (::sharedPreferences.isInitialized) {
            sharedPreferences.edit().remove("user_token").apply()
        }
    }

    private fun getAuthHeader(): String? {
        return sharedPreferences.getString("auth_token", null)
    }

    // Méthodes pour accéder aux endpoints avec authentification correcte
    suspend fun getMyProjects() = apiService.getProjetsEtudiant(getAuthHeader() ?: "")
    suspend fun getMyTasks() = apiService.getMesTaches(getAuthHeader() ?: "")
    suspend fun getMyTasksSorted(sort: String?) = apiService.getTachesTriees(getAuthHeader() ?: "", sort)
    suspend fun updateTaskStatus(taskId: String, status: String) = apiService.updateStatutTache(getAuthHeader() ?: "", taskId, status)
    suspend fun submitLivrable(livrableId: String, file: okhttp3.MultipartBody.Part) = apiService.soumettreLivrable(getAuthHeader() ?: "", livrableId, file)
    suspend fun getLivrableComments(livrableId: String) = apiService.getCommentairesLivrable(getAuthHeader() ?: "", livrableId)
    suspend fun getNotifications() = apiService.getNotifications(getAuthHeader() ?: "")
    suspend fun getMyFeedbacks() = apiService.getMyFeedbacks(getAuthHeader() ?: "")
    suspend fun getMyEvents() = apiService.getMyEvents(getAuthHeader() ?: "")
    suspend fun getEventsForDate(date: String) = apiService.getEventsForDate(getAuthHeader() ?: "", date)
    
    // Nouveaux endpoints du backend
    suspend fun register(req: com.example.scolabstudentapp.models.ReqRes) = authService.register(req)
    suspend fun login(req: com.example.scolabstudentapp.models.ReqRes) = authService.login(req)
    suspend fun refreshToken(req: com.example.scolabstudentapp.models.ReqRes) = authService.refreshToken(req)
    suspend fun getAuthProfile() = authService.getProfile()
    suspend fun updateProfile(updateRequest: com.example.scolabstudentapp.models.ReqRes) = authService.updateProfile(updateRequest)
    suspend fun verifyToken(request: Map<String, String>) = authService.verifyToken(request)
    suspend fun logout() = authService.logout()
    suspend fun verifyEmail(request: Map<String, String>) = authService.verifyEmail(request)
    suspend fun resendVerification(request: Map<String, String>) = authService.resendVerification(request)
    suspend fun forgotPassword(request: Map<String, String>) = authService.forgotPassword(request)
    suspend fun resetPassword(resetRequest: com.example.scolabstudentapp.models.ReqRes) = authService.resetPassword(resetRequest)
    suspend fun changePassword(passwordRequest: com.example.scolabstudentapp.models.ReqRes) = authService.changePassword(passwordRequest)
    suspend fun oauth2Success(token: String) = authService.oauth2Success(token)
    
    // Endpoints étudiants
    suspend fun getEtudiantProjets() = etudiantApiService.getProjetsEtudiant()
    suspend fun getProjectDetails(projectId: String): retrofit2.Response<com.example.scolabstudentapp.models.Projet> {
        return etudiantApiService.getProjectDetails(projectId)
    }
    
    suspend fun getEtudiantCalendrier() = etudiantApiService.getCalendrier()
    suspend fun getEtudiantTaches(sort: String? = null) = etudiantApiService.getTachesEtudiant(sort)
    suspend fun soumettreEtudiantLivrable(livrableId: String, file: okhttp3.MultipartBody.Part) = etudiantApiService.soumettreLivrable(livrableId, file)
    suspend fun getEtudiantLivrableComments(livrableId: String) = etudiantApiService.getCommentairesLivrable(livrableId)
    suspend fun changerEtudiantTacheStatut(tacheId: String, statut: String) = etudiantApiService.changerStatutTache(tacheId, statut)
    suspend fun getEtudiantNotifications() = etudiantApiService.getNotificationsEtudiant()
}