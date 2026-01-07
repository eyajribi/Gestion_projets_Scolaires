package com.example.scolabstudentapp.di

import android.content.Context
import com.example.scolabstudentapp.api.ApiService
import com.example.scolabstudentapp.api.AuthService
import com.example.scolabstudentapp.api.EtudiantApiService
import com.example.scolabstudentapp.api.RetrofitClient
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ApiModule {

    @Provides
    @Singleton
    fun provideApiService(): ApiService {
        return RetrofitClient.getApiService()
    }

    @Provides
    @Singleton
    fun provideAuthService(): AuthService {
        return RetrofitClient.getAuthService()
    }

    @Provides
    @Singleton
    fun provideEtudiantApiService(): EtudiantApiService {
        return RetrofitClient.getEtudiantApiService()
    }

    @Provides
    @Singleton
    fun provideRetrofitClient(@ApplicationContext context: Context): RetrofitClient {
        RetrofitClient.initialize(context)
        return RetrofitClient
    }
}
