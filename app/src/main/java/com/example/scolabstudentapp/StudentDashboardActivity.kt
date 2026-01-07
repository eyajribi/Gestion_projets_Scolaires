package com.example.scolabstudentapp

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.databinding.ActivityStudentDashboardBinding
import com.example.scolabstudentapp.databinding.DialogEditProfileBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class StudentDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityStudentDashboardBinding
    @Inject lateinit var authManager: AuthManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityStudentDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupClickListeners()
        loadDashboardData()
        
        println("DEBUG: StudentDashboardActivity onCreate completed successfully")
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Tableau de bord"
    }

    private fun setupClickListeners() {
        // Bouton profil
        binding.profileButton.setOnClickListener {
            showEditProfileDialog()
        }

        // Projets
        binding.quickAccessProjectsCard.setOnClickListener {
            val intent = Intent(this@StudentDashboardActivity, com.example.scolabstudentapp.ProjectsActivity::class.java)
            startActivity(intent)
        }

        // Tâches
        binding.quickAccessTasksCard.setOnClickListener {
            val intent = Intent(this@StudentDashboardActivity, com.example.scolabstudentapp.TasksActivity::class.java)
            startActivity(intent)
        }

        // Calendrier
        binding.quickAccessCalendarCard.setOnClickListener {
            val intent = Intent(this@StudentDashboardActivity, CalendarActivity::class.java)
            startActivity(intent)
        }

        // Notifications
        binding.quickAccessNotificationsCard.setOnClickListener {
            val intent = Intent(this@StudentDashboardActivity, NotificationsActivity::class.java)
            startActivity(intent)
        }

        // Livrables
        binding.quickAccessDeliverablesCard.setOnClickListener {
            val intent = Intent(this@StudentDashboardActivity, DeliverablesActivity::class.java)
            startActivity(intent)
        }

        // Feedbacks
        binding.quickAccessFeedbacksCard.setOnClickListener {
            val intent = Intent(this@StudentDashboardActivity, FeedbacksActivity::class.java)
            startActivity(intent)
        }
    }

    private fun loadDashboardData() {
        println("DEBUG: Chargement des données du dashboard")
        lifecycleScope.launch {
            try {
                // Essayer avec AuthManager d'abord
                val localUser = authManager.getCurrentUser()
                if (localUser != null) {
                    println("DEBUG: Utilisateur trouvé dans AuthManager: ${localUser.email}")
                    updateUI(localUser)
                    loadStatistics()
                } else {
                    println("DEBUG: Aucun utilisateur dans AuthManager")
                    showError("Aucun utilisateur connecté")
                }
                
            } catch (e: Exception) {
                println("DEBUG: Exception chargement profil: ${e.message}")
                showError("Erreur de chargement: ${e.message}")
            }
        }
    }

    private fun updateUI(user: com.example.scolabstudentapp.models.User) {
        binding.apply {
            studentNameText.text = "Bonjour, ${user.prenom} ${user.nom}"
            emailText.text = user.email
        }
    }

    private fun loadStatistics() {
        lifecycleScope.launch {
            try {
                // Charger les projets
                val projectsResponse = RetrofitClient.getEtudiantProjets()
                val projectsCount = if (projectsResponse.isSuccessful) {
                    projectsResponse.body()?.size ?: 0
                } else 0

                // Charger les tâches
                val tasksResponse = RetrofitClient.getEtudiantTaches()
                val tasksCount = if (tasksResponse.isSuccessful) {
                    tasksResponse.body()?.size ?: 0
                } else 0

                // Charger les notifications
                val notificationsResponse = RetrofitClient.getEtudiantNotifications()
                val notificationsCount = if (notificationsResponse.isSuccessful) {
                    notificationsResponse.body()?.size ?: 0
                } else 0

                // Mettre à jour l'UI avec les IDs corrects
                try {
                    binding.projectsCount.text = projectsCount.toString()
                } catch (e: Exception) {
                    println("DEBUG: Erreur projectsCount: ${e.message}")
                }
                
                try {
                    binding.tasksCount.text = tasksCount.toString()
                } catch (e: Exception) {
                    println("DEBUG: Erreur tasksCount: ${e.message}")
                }
                
                try {
                    binding.notificationsCount.text = notificationsCount.toString()
                } catch (e: Exception) {
                    println("DEBUG: Erreur notificationsCount: ${e.message}")
                }

                // Mettre à jour l'activité récente
                updateRecentActivity(projectsCount, tasksCount, notificationsCount)

            } catch (e: Exception) {
                println("DEBUG: Erreur chargement statistiques: ${e.message}")
            }
        }
    }

    private fun updateRecentActivity(projectsCount: Int, tasksCount: Int, notificationsCount: Int) {
        val activity = when {
            notificationsCount > 0 -> "Vous avez $notificationsCount notification(s)"
            tasksCount > 0 -> "Vous avez $tasksCount tâche(s) en cours"
            projectsCount > 0 -> "Vous participez à $projectsCount projet(s)"
            else -> "Aucune activité récente"
        }
        
        try {
            binding.recentActivityText.text = activity
        } catch (e: Exception) {
            println("DEBUG: Erreur recentActivityText: ${e.message}")
        }
    }

    private fun showEditProfileDialog() {
        val dialogBinding = DialogEditProfileBinding.inflate(LayoutInflater.from(this))
        
        // Récupérer l'utilisateur actuel
        val currentUser = authManager.getCurrentUser()
        if (currentUser != null) {
            dialogBinding.apply {
                nomEditText.setText(currentUser.nom)
                prenomEditText.setText(currentUser.prenom)
                emailEditText.setText(currentUser.email)
                phoneEditText.setText(currentUser.numTel ?: "")
                faculteEditText.setText(currentUser.nomFac ?: "")
            }
        }

        val dialog = AlertDialog.Builder(this)
            .setView(dialogBinding.root)
            .setCancelable(true)
            .create()

        dialogBinding.cancelButton.setOnClickListener {
            dialog.dismiss()
        }

        dialogBinding.saveButton.setOnClickListener {
            saveProfile(dialogBinding, dialog)
        }

        dialog.show()
    }

    private fun saveProfile(dialogBinding: DialogEditProfileBinding, dialog: AlertDialog) {
        val nom = dialogBinding.nomEditText.text.toString().trim()
        val prenom = dialogBinding.prenomEditText.text.toString().trim()
        val phone = dialogBinding.phoneEditText.text.toString().trim()
        val faculte = dialogBinding.faculteEditText.text.toString().trim()

        if (nom.isEmpty() || prenom.isEmpty()) {
            Toast.makeText(this, "Le nom et le prénom sont obligatoires", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                // TODO: Implémenter l'appel API pour la mise à jour
                Toast.makeText(this@StudentDashboardActivity, "Profil mis à jour localement", Toast.LENGTH_SHORT).show()
                
                // Recharger les données
                loadDashboardData()
                dialog.dismiss()
                
            } catch (e: Exception) {
                println("DEBUG: Erreur mise à jour profil: ${e.message}")
                Toast.makeText(this@StudentDashboardActivity, "Erreur réseau: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.dashboard_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_profile -> {
                showEditProfileDialog()
                true
            }
            R.id.action_projects -> {
                val intent = Intent(this, ProjectsActivity::class.java)
                startActivity(intent)
                true
            }
            R.id.action_tasks -> {
                val intent = Intent(this, TasksActivity::class.java)
                startActivity(intent)
                true
            }
            R.id.action_livrables -> {
                val intent = Intent(this, DeliverablesActivity::class.java)
                startActivity(intent)
                true
            }
            R.id.action_feedbacks -> {
                val intent = Intent(this, FeedbacksActivity::class.java)
                startActivity(intent)
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun showError(message: String) {
        Toast.makeText(this@StudentDashboardActivity, message, Toast.LENGTH_SHORT).show()
    }

    override fun onResume() {
        super.onResume()
        // Recharger les données à chaque retour sur le dashboard
        loadDashboardData()
    }
}