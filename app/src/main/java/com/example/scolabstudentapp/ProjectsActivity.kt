package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.adapters.ProjectsAdapter
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.databinding.ActivityProjectsBinding
import com.example.scolabstudentapp.models.Projet
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ProjectsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProjectsBinding
    private lateinit var projectAdapter: ProjectsAdapter
    private var allProjects: List<Projet> = listOf()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProjectsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupRecyclerView()
        setupSearch()
        loadProjects()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressedDispatcher.onBackPressed() }
    }

    private fun setupRecyclerView() {
        projectAdapter = ProjectsAdapter(emptyList()) { project ->
            val intent = Intent(this, ProjectDetailActivity::class.java)
            intent.putExtra("PROJECT_ID", project.id)
            intent.putExtra("PROJECT_NAME", project.nom)
            intent.putExtra("PROJECT_DESCRIPTION", project.description)
            startActivity(intent)
        }
        binding.projectsRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.projectsRecyclerView.adapter = projectAdapter
    }

    private fun updateRecyclerView(projects: List<Projet>) {
        // Créer un nouvel adapter avec la nouvelle liste
        val newAdapter = ProjectsAdapter(projects) { project ->
            val intent = Intent(this, ProjectDetailActivity::class.java)
            intent.putExtra("PROJECT_ID", project.id)
            intent.putExtra("PROJECT_NAME", project.nom)
            intent.putExtra("PROJECT_DESCRIPTION", project.description)
            startActivity(intent)
        }
        binding.projectsRecyclerView.adapter = newAdapter
    }

    private fun setupSearch() {
        binding.searchEditText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filterProjects(s?.toString() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })
        binding.searchButton.setOnClickListener {
            filterProjects(binding.searchEditText.text.toString())
        }
    }

    private fun filterProjects(query: String) {
        val filtered = if (query.isBlank()) {
            allProjects
        } else {
            allProjects.filter {
                it.nom.contains(query, ignoreCase = true) ||
                (it.description?.contains(query, ignoreCase = true) ?: false)
            }
        }
        updateRecyclerView(filtered)
    }

    private fun loadProjects() {
        lifecycleScope.launch {
            try {
                binding.progressBar.visibility = View.VISIBLE
                val response = RetrofitClient.getEtudiantProjets()
                println("DEBUG: Réponse API projets: ${response.isSuccessful}")
                
                if (response.isSuccessful) {
                    val projects = response.body()
                    if (projects != null && projects.isNotEmpty()) {
                        allProjects = projects
                        showContent(true)
                        updateRecyclerView(projects)
                    } else {
                        showContent(false)
                    }
                } else {
                    println("DEBUG: Erreur API projets: ${response.code()} - ${response.message()}")
                    showContent(false)
                    Toast.makeText(this@ProjectsActivity, "Erreur de chargement: ${response.message()}", Toast.LENGTH_LONG).show()
                }
                
            } catch (e: Exception) {
                println("DEBUG: Exception chargement projets: ${e.message}")
                showContent(false)
                Toast.makeText(this@ProjectsActivity, "Erreur réseau: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun showContent(hasContent: Boolean) {
        if (hasContent) {
            binding.projectsRecyclerView.visibility = View.VISIBLE
            binding.emptyState.visibility = View.GONE
        } else {
            binding.projectsRecyclerView.visibility = View.GONE
            binding.emptyState.visibility = View.VISIBLE
        }
    }
}
