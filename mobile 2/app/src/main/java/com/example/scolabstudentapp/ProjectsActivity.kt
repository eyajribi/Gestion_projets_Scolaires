package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.databinding.ActivityProjectsBinding
import kotlinx.coroutines.launch

class ProjectsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProjectsBinding

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
        binding.projectsRecyclerview.layoutManager = LinearLayoutManager(this)
    }

    private fun loadProjects() {
        lifecycleScope.launch {
            try {
                val studentId = "some-student-id" // TODO: Remplacer par l'ID de l'étudiant connecté
                val response = ApiClient.apiService.getProjects(studentId)
                if (response.isSuccessful) {
                    val projects = response.body() ?: emptyList()
                    binding.projectsRecyclerview.adapter = ProjectsAdapter(projects) { project ->
                        // Lancer l'activité de détail lors du clic
                        Intent(this@ProjectsActivity, ProjectDetailActivity::class.java).also {
                            it.putExtra("EXTRA_PROJECT", project)
                            startActivity(it)
                        }
                    }
                } else {
                    Toast.makeText(this@ProjectsActivity, "Erreur de chargement des projets", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ProjectsActivity, "Erreur réseau: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
