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
        sharedPreferences.edit().putString("user_token", token).apply()
    }

    fun getToken(): String? {
        return sharedPreferences.getString("user_token", null)
    }

    fun clearTokens() {
        sharedPreferences.edit().remove("user_token").apply()
    }

    fun isUserLoggedIn(): Boolean {
        return !getToken().isNullOrEmpty()
    }
}