package com.example.scolabstudentapp

import android.app.Application
import com.example.scolabstudentapp.api.RetrofitClient
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ScolabStudentApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialiser RetrofitClient avec le contexte de l'application
        RetrofitClient.initialize(this)
    }
}
