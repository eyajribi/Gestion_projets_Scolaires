package com.example.scolabstudentapp

import android.content.Context
import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.repositories.AuthRepository
import com.example.scolabstudentapp.repositories.EtudiantRepository
import com.example.scolabstudentapp.repositories.ProjectRepository
import com.example.scolabstudentapp.repositories.ProjectDetailRepository
import com.example.scolabstudentapp.repositories.ProfileRepository
import com.example.scolabstudentapp.database.dao.ProjectDao
import com.example.scolabstudentapp.database.dao.EtudiantDao
import com.example.scolabstudentapp.database.dao.GroupeDao
import com.example.scolabstudentapp.database.AppDatabase
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/**
 * Un injecteur de dépendances manuel simple qui agit comme un conteneur de services.
 */
object Injector {

    private var apiService: ApiService? = null
    private var authManager: AuthManager? = null
    private var authRepository: AuthRepository? = null
    private var etudiantRepository: EtudiantRepository? = null
    private var projectRepository: ProjectRepository? = null
    private var projectDetailRepository: ProjectDetailRepository? = null
    private var profileRepository: ProfileRepository? = null

    private fun provideApiService(): ApiService {
        if (apiService == null) {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            val okHttpClient = OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .build()

            apiService = Retrofit.Builder()
                .baseUrl("http://10.0.2.2:8080/")
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ApiService::class.java)
        }
        return apiService!!
    }

    fun provideAuthManager(context: Context): AuthManager {
        if (authManager == null) {
            authManager = AuthManager(context.applicationContext)
        }
        return authManager!!
    }

    fun provideAuthRepository(context: Context): AuthRepository {
        if (authRepository == null) {
            authRepository = AuthRepository(provideApiService(), provideAuthManager(context), provideEtudiantRepository(context))
        }
        return authRepository!!
    }
    
    fun provideEtudiantRepository(context: Context): EtudiantRepository {
        if (etudiantRepository == null) {
            etudiantRepository = EtudiantRepository(provideEtudiantDao(context), provideGroupeDao(context))
        }
        return etudiantRepository!!
    }
    
    fun provideEtudiantDao(context: Context): EtudiantDao {
        return provideAppDatabase(context).etudiantDao()
    }
    
    fun provideGroupeDao(context: Context): GroupeDao {
        return provideAppDatabase(context).groupeDao()
    }
    
    private fun provideAppDatabase(context: Context): AppDatabase {
        return AppDatabase.getDatabase(context)
    }

    fun provideProjectRepository(context: Context, projectDao: ProjectDao): ProjectRepository {
        if (projectRepository == null) {
            projectRepository = ProjectRepository(provideApiService(), projectDao, provideAuthManager(context))
        }
        return projectRepository!!
    }

    fun provideProjectDetailRepository(context: Context): ProjectDetailRepository {
        if (projectDetailRepository == null) {
            projectDetailRepository = ProjectDetailRepository(provideApiService(), provideAuthManager(context))
        }
        return projectDetailRepository!!
    }

    fun provideProfileRepository(context: Context): ProfileRepository {
        if (profileRepository == null) {
            profileRepository = ProfileRepository(provideApiService(), provideAuthManager(context))
        }
        return profileRepository!!
    }
}
