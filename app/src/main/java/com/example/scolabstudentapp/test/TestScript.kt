package com.example.scolabstudentapp.test

import android.util.Log
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.models.ReqRes
import kotlinx.coroutines.runBlocking

/**
 * Script de test pour vérifier la connexion et les fonctionnalités
 * avec l'utilisateur islem@gmail.com
 */
object TestScript {
    
    private const val TEST_EMAIL = "islem@gmail.com"
    private const val TEST_PASSWORD = "azertyA1*"
    
    fun runCompleteTest() {
        Log.d("TEST_SCRIPT", "🚀 DÉBUT DU TEST COMPLET")
        Log.d("TEST_SCRIPT", "📧 Email: $TEST_EMAIL")
        Log.d("TEST_SCRIPT", "🔑 Mot de passe: $TEST_PASSWORD")
        
        runBlocking {
            try {
                // Étape 1: Test de connexion
                testLogin()
                
                // Étape 2: Test du profil utilisateur
                testUserProfile()
                
                // Étape 3: Test des projets
                testProjects()
                
                // Étape 4: Test des tâches
                testTasks()
                
                // Étape 5: Test du calendrier
                testCalendar()
                
                // Étape 6: Test des notifications
                testNotifications()
                
                Log.d("TEST_SCRIPT", "✅ TEST COMPLET TERMINÉ AVEC SUCCÈS")
                
            } catch (e: Exception) {
                Log.e("TEST_SCRIPT", "❌ ERREUR LORS DU TEST: ${e.message}")
                e.printStackTrace()
            }
        }
    }
    
    private suspend fun testLogin() {
        Log.d("TEST_SCRIPT", "🔐 ÉTAPE 1: TEST DE CONNEXION")
        
        try {
            val loginRequest = ReqRes(
                email = TEST_EMAIL,
                password = TEST_PASSWORD
            )
            
            val response = RetrofitClient.login(loginRequest)
            
            if (response.isSuccessful) {
                val result = response.body()
                Log.d("TEST_SCRIPT", "✅ Connexion réussie")
                Log.d("TEST_SCRIPT", "📋 Status: ${result?.status}")
                Log.d("TEST_SCRIPT", "📋 Message: ${result?.message}")
                Log.d("TEST_SCRIPT", "🔑 Token: ${result?.token?.take(20)}...")
                
                // Sauvegarder le token pour les tests suivants
                result?.token?.let { token ->
                    RetrofitClient.saveToken(token)
                    Log.d("TEST_SCRIPT", "💾 Token sauvegardé")
                }
                
            } else {
                Log.e("TEST_SCRIPT", "❌ Échec de connexion: ${response.code()}")
                Log.e("TEST_SCRIPT", "📋 Erreur: ${response.message()}")
            }
            
        } catch (e: Exception) {
            Log.e("TEST_SCRIPT", "❌ Exception connexion: ${e.message}")
            throw e
        }
    }
    
    private suspend fun testUserProfile() {
        Log.d("TEST_SCRIPT", "👤 ÉTAPE 2: TEST PROFIL UTILISATEUR")
        
        try {
            val response = RetrofitClient.getAuthProfile()
            
            if (response.isSuccessful) {
                val result = response.body()
                Log.d("TEST_SCRIPT", "✅ Profil chargé")
                Log.d("TEST_SCRIPT", "📋 Status: ${result?.status}")
                Log.d("TEST_SCRIPT", "👤 Utilisateur: ${result?.data}")
                
                result?.data?.let { userData ->
                    Log.d("TEST_SCRIPT", "✅ Profil utilisateur chargé avec succès")
                    Log.d("TEST_SCRIPT", "📋 Données: ${userData.toString()}")
                }
                
            } else {
                Log.e("TEST_SCRIPT", "❌ Échec profil: ${response.code()}")
            }
            
        } catch (e: Exception) {
            Log.e("TEST_SCRIPT", "❌ Exception profil: ${e.message}")
            throw e
        }
    }
    
    private suspend fun testProjects() {
        Log.d("TEST_SCRIPT", "📁 ÉTAPE 3: TEST DES PROJETS")
        
        try {
            val response = RetrofitClient.getEtudiantProjets()
            
            if (response.isSuccessful) {
                val projects = response.body() ?: emptyList()
                Log.d("TEST_SCRIPT", "✅ Projets chargés: ${projects.size}")
                
                projects.forEachIndexed { index, project ->
                    Log.d("TEST_SCRIPT", "📁 Projet $index:")
                    Log.d("TEST_SCRIPT", "   📋 ID: ${project.id}")
                    Log.d("TEST_SCRIPT", "   📝 Nom: ${project.nom}")
                    Log.d("TEST_SCRIPT", "   📄 Description: ${project.description}")
                    Log.d("TEST_SCRIPT", "   📅 Date début: ${project.dateDebut}")
                    Log.d("TEST_SCRIPT", "   📅 Date fin: ${project.dateFin}")
                    Log.d("TEST_SCRIPT", "   🎯 Statut: ${project.statut}")
                }
                
            } else {
                Log.e("TEST_SCRIPT", "❌ Échec projets: ${response.code()}")
            }
            
        } catch (e: Exception) {
            Log.e("TEST_SCRIPT", "❌ Exception projets: ${e.message}")
            throw e
        }
    }
    
    private suspend fun testTasks() {
        Log.d("TEST_SCRIPT", "📋 ÉTAPE 4: TEST DES TÂCHES")
        
        try {
            val response = RetrofitClient.getEtudiantTaches()
            
            if (response.isSuccessful) {
                val tasks = response.body() ?: emptyList()
                Log.d("TEST_SCRIPT", "✅ Tâches chargées: ${tasks.size}")
                
                tasks.forEachIndexed { index, task ->
                    Log.d("TEST_SCRIPT", "📋 Tâche $index:")
                    Log.d("TEST_SCRIPT", "   📋 ID: ${task.id}")
                    Log.d("TEST_SCRIPT", "   📝 Titre: ${task.titre}")
                    Log.d("TEST_SCRIPT", "   📄 Description: ${task.description}")
                    Log.d("TEST_SCRIPT", "   📅 Échéance: ${task.dateEcheance}")
                    Log.d("TEST_SCRIPT", "   🎯 Statut: ${task.statut}")
                    Log.d("TEST_SCRIPT", "   🔥 Priorité: ${task.priorite}")
                }
                
                // Test de changement de statut
                if (tasks.isNotEmpty()) {
                    testChangeTaskStatus(tasks[0].id)
                }
                
            } else {
                Log.e("TEST_SCRIPT", "❌ Échec tâches: ${response.code()}")
            }
            
        } catch (e: Exception) {
            Log.e("TEST_SCRIPT", "❌ Exception tâches: ${e.message}")
            throw e
        }
    }
    
    private suspend fun testChangeTaskStatus(taskId: String) {
        Log.d("TEST_SCRIPT", "🔄 ÉTAPE 4.1: TEST CHANGEMENT STATUT TÂCHE")
        
        try {
            val response = RetrofitClient.changerEtudiantTacheStatut(taskId, "TERMINE")
            
            if (response.isSuccessful) {
                val updatedTask = response.body()
                Log.d("TEST_SCRIPT", "✅ Statut tâche changé")
                Log.d("TEST_SCRIPT", "📋 Tâche mise à jour: ${updatedTask?.titre}")
                Log.d("TEST_SCRIPT", "🎯 Nouveau statut: ${updatedTask?.statut}")
                
            } else {
                Log.e("TEST_SCRIPT", "❌ Échec changement statut: ${response.code()}")
            }
            
        } catch (e: Exception) {
            Log.e("TEST_SCRIPT", "❌ Exception changement statut: ${e.message}")
        }
    }
    
    private suspend fun testCalendar() {
        Log.d("TEST_SCRIPT", "📅 ÉTAPE 5: TEST DU CALENDRIER")
        
        try {
            val response = RetrofitClient.getEtudiantCalendrier()
            
            if (response.isSuccessful) {
                val calendarData = response.body()
                Log.d("TEST_SCRIPT", "✅ Calendrier chargé")
                Log.d("TEST_SCRIPT", "📅 Données: $calendarData")
                
            } else {
                Log.e("TEST_SCRIPT", "❌ Échec calendrier: ${response.code()}")
            }
            
        } catch (e: Exception) {
            Log.e("TEST_SCRIPT", "❌ Exception calendrier: ${e.message}")
            throw e
        }
    }
    
    private suspend fun testNotifications() {
        Log.d("TEST_SCRIPT", "🔔 ÉTAPE 6: TEST DES NOTIFICATIONS")
        
        try {
            val response = RetrofitClient.getEtudiantNotifications()
            
            if (response.isSuccessful) {
                val notifications = response.body() ?: emptyList()
                Log.d("TEST_SCRIPT", "✅ Notifications chargées: ${notifications.size}")
                
                notifications.forEachIndexed { index, notification ->
                    Log.d("TEST_SCRIPT", "🔔 Notification $index:")
                    Log.d("TEST_SCRIPT", "   📋 ID: ${notification.id}")
                    Log.d("TEST_SCRIPT", "   📝 Message: ${notification.message}")
                    Log.d("TEST_SCRIPT", "   📅 Date: ${notification.dateCreation}")
                    Log.d("TEST_SCRIPT", "   🎭 Type: ${notification.type}")
                }
                
            } else {
                Log.e("TEST_SCRIPT", "❌ Échec notifications: ${response.code()}")
            }
            
        } catch (e: Exception) {
            Log.e("TEST_SCRIPT", "❌ Exception notifications: ${e.message}")
            throw e
        }
    }
    
    fun testBackendConnectivity() {
        Log.d("TEST_SCRIPT", "🌐 TEST DE CONNECTIVITÉ BACKEND")
        
        runBlocking {
            try {
                // Test simple de connexion
                val loginRequest = ReqRes(
                    email = TEST_EMAIL,
                    password = TEST_PASSWORD
                )
                
                val response = RetrofitClient.login(loginRequest)
                
                if (response.isSuccessful) {
                    Log.d("TEST_SCRIPT", "✅ Backend accessible")
                    Log.d("TEST_SCRIPT", "📋 URL: ${RetrofitClient.getCurrentBaseUrl()}")
                } else {
                    Log.e("TEST_SCRIPT", "❌ Backend inaccessible")
                    Log.e("TEST_SCRIPT", "📋 Code: ${response.code()}")
                }
                
            } catch (e: Exception) {
                Log.e("TEST_SCRIPT", "❌ Exception connexion: ${e.message}")
            }
        }
    }
}
