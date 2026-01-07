package com.example.scolabstudentapp.api

import android.content.Context
import android.content.SharedPreferences
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:8080/" // Pour l'émulateur

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

    // Gestion des tokens
    fun saveToken(token: String?) {
        if (::sharedPreferences.isInitialized) {
            sharedPreferences.edit().putString("user_token", token).apply()
        }
    }

    fun getToken(): String? {
        return if (::sharedPreferences.isInitialized) {
            sharedPreferences.getString("user_token", null)
        } else {
            null
        }
    }

    fun clearTokens() {
        if (::sharedPreferences.isInitialized) {
            sharedPreferences.edit().remove("user_token").apply()
        }
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
}