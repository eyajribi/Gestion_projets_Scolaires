package com.example.scolabstudentapp.repositories

import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.auth.AuthManager
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProjectDetailRepository @Inject constructor(
    private val apiService: ApiService,
    private val authManager: AuthManager
) {
    // Ajoutez ici les méthodes nécessaires pour gérer les détails d'un projet
}

