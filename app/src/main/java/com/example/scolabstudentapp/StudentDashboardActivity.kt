package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.adapters.DeadlineTaskAdapter
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.databinding.ActivityStudentDashboardBinding
import com.example.scolabstudentapp.models.Tache
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class StudentDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityStudentDashboardBinding
    
    @Inject
    lateinit var authManager: AuthManager
    
    @Inject
    lateinit var etudiantRepository: EtudiantRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        try {
            super.onCreate(savedInstanceState)
            binding = ActivityStudentDashboardBinding.inflate(layoutInflater)
            setContentView(binding.root)

            setSupportActionBar(binding.toolbar)
            supportActionBar?.setDisplayHomeAsUpEnabled(true)
            
            // Configuration des listeners
            setupClickListeners()
            
            // Chargement des données
            loadAllDashboardData()
            
            println("DEBUG: StudentDashboardActivity onCreate completed successfully")
            
        } catch (e: Exception) {
            println("DEBUG: Error in StudentDashboardActivity onCreate: ${e.message}")
            e.printStackTrace()
        }
    }

    private fun setupClickListeners() {
        binding.quickAccessProjectsCard.setOnClickListener {
            startActivity(Intent(this, ProjectsActivity::class.java))
        }

        binding.quickAccessTasksCard.setOnClickListener {
            startActivity(Intent(this, TasksActivity::class.java))
        }

        binding.quickAccessFeedbacksCard.setOnClickListener {
            startActivity(Intent(this, FeedbacksActivity::class.java))
        }
    }

    private fun loadDashboardData() {
        val userId = authManager.getUserId()
        if (userId == null) {
            // Should not happen if the user is logged in, but as a safeguard:
            Toast.makeText(this, "Utilisateur non identifié.", Toast.LENGTH_SHORT).show()
            logout()
            return
        }

        loadUserInfo()
        loadUpcomingDeadlines(userId)
    }

    private fun loadUserInfo() {
        lifecycleScope.launch {
            try {
                val authHeader = authManager.getAuthHeader() ?: return@launch
                val response = RetrofitClient.apiService.getProfile(authHeader)

                if (response.isSuccessful && response.body() != null) {
                    val user = response.body()!!.user
                    binding.studentNameText.text = "Bonjour, ${user.prenom} ${user.nom}"
                    binding.emailText.text = user.email
                    binding.phoneText.text = user.numTel ?: "Non renseigné"
                } else {
                    binding.studentNameText.text = "Bonjour, Étudiant"
                    Toast.makeText(this@StudentDashboardActivity, "Erreur de chargement du profil", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                binding.studentNameText.text = "Bonjour, Étudiant"
                Toast.makeText(this@StudentDashboardActivity, "Erreur réseau: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun loadDeadlines() {
        lifecycleScope.launch {
            try {
                val user = authManager.getCurrentUser()
                println("DEBUG: User dans loadDeadlines: $user")
                // Ne pas écraser le nom déjà affiché
                if (binding.studentNameText.text.isNullOrEmpty()) {
                    binding.studentNameText.text = "Bonjour, ${user?.prenom ?: "Étudiant"}"
                }
                
                // Simuler des échéances pour le test
                val sampleDeadlines = listOf(
                    mapOf("title" to "Analyse des besoins", "date" to "2024-01-25"),
                    mapOf("title" to "Design UI/UX", "date" to "2024-02-10"),
                    mapOf("title" to "Développement Backend", "date" to "2024-02-28")
                )
                
                updateDeadlinesUI(sampleDeadlines)
                
            } catch (e: Exception) {
                println("DEBUG: Erreur loadDeadlines: ${e.message}")
                e.printStackTrace()
            }
        }
    }

    private fun updateDeadlinesUI(tasks: List<Map<String, String>>) {
        if (tasks.isEmpty()) {
            binding.emptyDeadlinesText.visibility = View.VISIBLE
            binding.deadlinesRecyclerview.visibility = View.GONE
        } else {
            binding.emptyDeadlinesText.visibility = View.GONE
            binding.deadlinesRecyclerview.visibility = View.VISIBLE
            // Pour l'instant, on n'affiche pas les échéances dans le RecyclerView
            // car l'adapter n'est pas configuré pour les Map<String, String>
        }
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.student_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.menu_profile -> {
                startActivity(Intent(this, ProfileActivity::class.java))
                true
            }
            R.id.menu_logout -> {
                logout()
                true
            }
            R.id.menu_livrables -> {
                startActivity(Intent(this, DeliverablesActivity::class.java))
                true
            }
            R.id.menu_feedbacks -> {
                startActivity(Intent(this, FeedbacksActivity::class.java))
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun logout() {
        authManager.clearToken()
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
