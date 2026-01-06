package com.example.scolabstudentapp

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.adapters.TaskAdapter
import com.example.scolabstudentapp.databinding.ActivityProjectDetailBinding
import com.example.scolabstudentapp.models.Projet
import com.example.scolabstudentapp.models.Tache
import com.example.scolabstudentapp.viewmodels.ProjectDetailViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ProjectDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProjectDetailBinding
    private val viewModel: ProjectDetailViewModel by viewModels()

    companion object {
        const val EXTRA_PROJECT_ID = "EXTRA_PROJECT_ID"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProjectDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressedDispatcher.onBackPressed() }

        val projectId = intent.getStringExtra(EXTRA_PROJECT_ID)
        if (projectId == null) {
            finish()
            return
        }

        viewModel.loadProject(projectId)
        setupObservers()
    }

    private fun setupObservers() {
        viewModel.project.observe(this) { project ->
            binding.progressBar.visibility = if (project == null) View.VISIBLE else View.GONE
            binding.contentGroup.visibility = if (project != null) View.VISIBLE else View.GONE

            if (project != null) {
                populateProjectDetails(project)
            } else {
                // Optional: Show an error message
            }
        }
    }

    private fun populateProjectDetails(project: Projet) {
        binding.toolbar.title = project.nom
        // Les vues suivantes n'existent pas dans le layout : projectNameDetailText, projectDescriptionDetailText, projectProgressLinearIndicator, projectProgressDetailText, teacherNameDetailText, tasksRecyclerview
        // On utilise les vues existantes : projectDescription, tasksRecyclerView
        // Affichage du nom du projet dans la toolbar
        // Affichage de la description
        binding.projectDescription.text = project.description
        // Affichage des tâches
        binding.tasksRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.tasksRecyclerView.adapter = TaskAdapter { task: Tache ->
            handleTaskAction(task)
        }
        // Les autres informations (progression, enseignant) ne sont pas disponibles dans le layout ni le modèle
    }

    private fun handleTaskAction(task: Tache) {
        // This functionality needs to be adapted based on the Tache model
        // and whether a submission URL is available.
        Toast.makeText(this, "Task action for: ${task.titre}", Toast.LENGTH_SHORT).show()
    }
}
