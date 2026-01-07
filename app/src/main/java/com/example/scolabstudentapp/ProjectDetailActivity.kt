package com.example.scolabstudentapp

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.databinding.ActivityProjectDetailBinding
import com.example.scolabstudentapp.models.Projet
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ProjectDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProjectDetailBinding
    private var projectId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProjectDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        projectId = intent.getStringExtra("PROJECT_ID")

        setupToolbar()
        loadProjectFromBackend(projectId ?: "")
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }
    }

    private fun loadProjectFromBackend(projectId: String) {
        lifecycleScope.launch {
            try {
                binding.progressBar.visibility = View.VISIBLE
                binding.contentGroup.visibility = View.GONE
                binding.errorView.visibility = View.GONE

                val response = RetrofitClient.getProjectDetails(projectId)

                if (response.isSuccessful) {
                    val project = response.body()
                    if (project != null) {
                        displayProjectDetails(project)
                    } else {
                        showError("Projet non trouvé")
                    }
                } else {
                    showError("Erreur de chargement: ${response.code()}")
                }

            } catch (e: Exception) {
                println("DEBUG: Erreur chargement projet: ${e.message}")
                showError("Erreur de connexion: ${e.message}")
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun displayProjectDetails(project: Projet) {
        binding.apply {
            contentGroup.visibility = View.VISIBLE

            projectTitle.text = project.nom
            projectDescription.text = project.description ?: "Aucune description disponible"
            projectStatus.text = project.statut?.toString() ?: "NON DÉFINI"
            projectStartDate.text = project.dateDebut?.toString() ?: "Non définie"
            projectEndDate.text = project.dateFin?.toString() ?: "Non définie"
        }
    }

    private fun showError(message: String) {
        binding.apply {
            errorView.visibility = View.VISIBLE
            errorText.text = message
            contentGroup.visibility = View.GONE
        }
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }

    companion object {
        const val PROJECT_ID = "PROJECT_ID"
        const val PROJECT_NAME = "PROJECT_NAME"
    }
}