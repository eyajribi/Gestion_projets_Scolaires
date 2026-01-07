package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.databinding.ActivityProjectsBinding
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.adapters.ProjectAdapter
import com.example.scolabstudentapp.repositories.EtudiantRepository
import com.example.scolabstudentapp.repositories.ProjectRepository
import dagger.hilt.android.AndroidEntryPoint
import android.view.View
import javax.inject.Inject
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.first

@AndroidEntryPoint
class ProjectsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProjectsBinding
    private lateinit var projectAdapter: ProjectAdapter
    
    @Inject
    lateinit var authManager: AuthManager
    
    @Inject
    lateinit var etudiantRepository: EtudiantRepository
    
    @Inject
    lateinit var projectRepository: ProjectRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProjectsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Configuration de la Toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressedDispatcher.onBackPressed() }

        setupRecyclerView()
        loadProjects()
    }

    private fun setupRecyclerView() {
        projectAdapter = ProjectAdapter { project ->
            // Lancer l'activité de détail lors du clic
            val intent = Intent(this@ProjectsActivity, ProjectDetailActivity::class.java)
            intent.putExtra(ProjectDetailActivity.EXTRA_PROJECT_ID, project.id)
            startActivity(intent)
        }
        binding.projectsRecyclerview.layoutManager = LinearLayoutManager(this)
        binding.projectsRecyclerview.adapter = projectAdapter
    }

    private fun loadProjects() {
        lifecycleScope.launch {
            try {
                showLoading(true)
                
                // Afficher les informations de l'étudiant connecté
                val etudiant = etudiantRepository.getCurrentEtudiant()
                binding.toolbar.title = "Projets - ${etudiant?.prenom ?: "Étudiant"}"
                
                // Utiliser le repository pour charger les projets depuis le backend
                val result = projectRepository.refreshProjects()
                
                if (result.isSuccess) {
                    // Charger les projets depuis la base locale en utilisant first() pour obtenir la valeur actuelle
                    val projectsList = projectRepository.allProjects.first()
                    projectAdapter.submitList(projectsList)
                    binding.emptyViewText.visibility = if (projectsList.isEmpty()) View.VISIBLE else View.GONE
                    binding.emptyViewText.text = "Aucun projet trouvé pour ${etudiant?.prenom ?: "l'étudiant"}"
                } else {
                    // En cas d'erreur, afficher les données de test
                    println("DEBUG: Erreur chargement projets, utilisation des données de test")
                    loadSampleProjects(etudiant?.prenom ?: "Étudiant")
                }
                
                Toast.makeText(this@ProjectsActivity, "Projets chargés", Toast.LENGTH_SHORT).show()
                
            } catch (e: Exception) {
                println("DEBUG: Exception dans loadProjects: ${e.message}")
                e.printStackTrace()
                // En cas d'exception, utiliser les données de test
                loadSampleProjects("Étudiant")
            } finally {
                showLoading(false)
            }
        }
    }
    
    private fun loadSampleProjects(studentName: String) {
        val sampleProjects = listOf(
            com.example.scolabstudentapp.models.Projet(
                id = "1",
                nom = "Application Mobile Scolab",
                description = "Développement d'une application mobile pour la gestion des projets scolaires",
                dateDebut = java.util.Date(),
                dateFin = java.util.Date(),
                statut = com.example.scolabstudentapp.models.StatutProjet.EN_COURS
            ),
            com.example.scolabstudentapp.models.Projet(
                id = "2",
                nom = "Site Web Universitaire",
                description = "Création d'un site web pour la faculté des sciences",
                dateDebut = java.util.Date(),
                dateFin = java.util.Date(),
                statut = com.example.scolabstudentapp.models.StatutProjet.EN_COURS
            ),
            com.example.scolabstudentapp.models.Projet(
                id = "3",
                nom = "Base de Données Étudiants",
                description = "Conception et implémentation d'une base de données pour la gestion des étudiants",
                dateDebut = java.util.Date(),
                dateFin = java.util.Date(),
                statut = com.example.scolabstudentapp.models.StatutProjet.PLANIFIE
            )
        )
        
        projectAdapter.submitList(sampleProjects)
        binding.emptyViewText.visibility = View.GONE
        Toast.makeText(this@ProjectsActivity, "${sampleProjects.size} projet(s) de test affiché(s)", Toast.LENGTH_SHORT).show()
    }
    
    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
    }
}
