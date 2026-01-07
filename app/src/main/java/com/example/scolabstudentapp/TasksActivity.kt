package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.databinding.ActivityTasksBinding
import com.example.scolabstudentapp.adapters.TaskAdapter
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.repositories.EtudiantRepository
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlinx.coroutines.launch

@AndroidEntryPoint
class TasksActivity : AppCompatActivity() {

    private lateinit var binding: ActivityTasksBinding
    private lateinit var taskAdapter: TaskAdapter
    
    @Inject
    lateinit var authManager: AuthManager
    
    @Inject
    lateinit var etudiantRepository: EtudiantRepository
    
    @Inject
    lateinit var taskRepository: TaskRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTasksBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Configuration de la Toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressedDispatcher.onBackPressed() }

        setupRecyclerView()
        loadAllTasks()
    }

    private fun setupRecyclerView() {
        taskAdapter = TaskAdapter { task ->
            // Action au clic sur le bouton de la tâche
            Intent(this@TasksActivity, DeliverablesActivity::class.java).also {
                it.putExtra("EXTRA_TASK_ID", task.id)
                startActivity(it)
            }
        }
        binding.tasksRecyclerview.layoutManager = LinearLayoutManager(this)
        binding.tasksRecyclerview.adapter = taskAdapter
    }

    private fun loadAllTasks() {
        showLoading(true)

        lifecycleScope.launch {
            try {
                // Afficher les informations de l'étudiant connecté
                val etudiant = etudiantRepository.getCurrentEtudiant()
                binding.toolbar.title = "Tâches - ${etudiant?.prenom ?: "Étudiant"}"
                
                // Utiliser le repository pour charger les tâches depuis le backend
                val result = taskRepository.getTasks()
                
                if (result.isSuccess) {
                    val tasks = result.getOrNull() ?: emptyList()
                    taskAdapter.submitList(tasks)
                    binding.emptyViewText.isVisible = tasks.isEmpty()
                    binding.emptyViewText.text = "Aucune tâche trouvée pour ${etudiant?.prenom ?: "l'étudiant"}"
                    Toast.makeText(this@TasksActivity, "${tasks.size} tâche(s) chargée(s)", Toast.LENGTH_SHORT).show()
                } else {
                    // En cas d'erreur, afficher les données de test
                    println("DEBUG: Erreur chargement tâches, utilisation des données de test")
                    loadSampleTasks(etudiant?.prenom ?: "Étudiant")
                }
                
            } catch (e: Exception) {
                println("DEBUG: Exception dans loadAllTasks: ${e.message}")
                e.printStackTrace()
                // En cas d'exception, utiliser les données de test
                loadSampleTasks("Étudiant")
            } finally {
                showLoading(false)
            }
        }
    }
    
    private fun loadSampleTasks(studentName: String) {
        val sampleTasks = listOf(
            com.example.scolabstudentapp.models.Tache(
                id = "1",
                titre = "Analyse des besoins",
                description = "Analyser les besoins fonctionnels du projet mobile",
                dateEcheance = "2024-01-25",
                statut = "TERMINEE",
                projetId = "1",
                priorite = "HAUTE"
            ),
            com.example.scolabstudentapp.models.Tache(
                id = "2",
                titre = "Design UI/UX",
                description = "Créer les maquettes et le design de l'interface utilisateur",
                dateEcheance = "2024-02-10",
                statut = "EN_COURS",
                projetId = "1",
                priorite = "MOYENNE"
            ),
            com.example.scolabstudentapp.models.Tache(
                id = "3",
                titre = "Développement Backend",
                description = "Implémenter l'API REST et la base de données",
                dateEcheance = "2024-02-28",
                statut = "A_FAIRE",
                projetId = "1",
                priorite = "HAUTE"
            ),
            com.example.scolabstudentapp.models.Tache(
                id = "4",
                titre = "Tests Unitaires",
                description = "Écrire et exécuter les tests unitaires pour l'application",
                dateEcheance = "2024-03-10",
                statut = "A_FAIRE",
                projetId = "1",
                priorite = "MOYENNE"
            ),
            com.example.scolabstudentapp.models.Tache(
                id = "5",
                titre = "Documentation",
                description = "Rédiger la documentation technique et utilisateur",
                dateEcheance = "2024-03-12",
                statut = "A_FAIRE",
                projetId = "2",
                priorite = "FAIBLE"
            )
        )
        
        taskAdapter.submitList(sampleTasks)
        binding.emptyViewText.isVisible = false
        Toast.makeText(this@TasksActivity, "${sampleTasks.size} tâche(s) de test affichée(s)", Toast.LENGTH_SHORT).show()
    }
    
    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
    }
}
