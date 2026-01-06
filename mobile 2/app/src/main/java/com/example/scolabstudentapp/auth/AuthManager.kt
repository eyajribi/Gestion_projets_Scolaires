package com.example.scolabstudentapp.auth

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthManager @Inject constructor(
   @ApplicationContext private val context: Context
) {

    private val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)

    fun saveToken(token: String) {
        prefs.edit().putString("jwt_token", token).apply()
    }

    fun getToken(): String? {
        return prefs.getString("jwt_token", null)
    }
    
    fun getAuthHeader(): String? {
        val token = getToken()
        return if (token != null) "Bearer $token" else null
    }

    fun clearToken() {
        prefs.edit().clear().apply()
    }

    fun isLoggedIn(): Boolean {
        return !getToken().isNullOrEmpty()
    }

    fun saveUserId(userId: String) {
        prefs.edit().putString("user_id", userId).apply()
    }

    fun getUserId(): String? {
        return prefs.getString("user_id", null)
    }
}
