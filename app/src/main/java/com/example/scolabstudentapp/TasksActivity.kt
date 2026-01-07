package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.databinding.ActivityTasksBinding
import com.example.scolabstudentapp.models.Tache
import com.example.scolabstudentapp.adapters.TasksAdapter
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class TasksActivity : AppCompatActivity() {

    private lateinit var binding: ActivityTasksBinding
    private var tasksList: List<Tache> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTasksBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        loadTasks()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Mes Tâches"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }
    }

    private fun loadTasks() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.getEtudiantTaches()
                println("DEBUG: Réponse API tâches: ${response.isSuccessful}")
                
                if (response.isSuccessful) {
                    val tasks = response.body()
                    if (tasks != null && tasks.isNotEmpty()) {
                        tasksList = tasks
                        showContent(true)
                        println("DEBUG: ${tasks.size} tâches chargées")
                    } else {
                        tasksList = emptyList()
                        showEmptyState(true)
                        println("DEBUG: Aucune tâche trouvée")
                    }
                } else {
                    showError("Erreur de chargement: ${response.code()}")
                    println("DEBUG: Erreur API: ${response.code()}")
                }
                
            } catch (e: Exception) {
                println("DEBUG: Exception tâches: ${e.message}")
                showError("Erreur réseau: ${e.message}")
            }
        }
    }

    private fun setupRecyclerView(tasks: List<Tache>) {
        val tasksAdapter = TasksAdapter(tasks) { task ->
            // Ouvrir les détails de la tâche ou autre action
            Toast.makeText(this@TasksActivity, "Tâche: ${task.titre}", Toast.LENGTH_SHORT).show()
        }
        
        binding.tasksRecyclerview.apply {
            layoutManager = LinearLayoutManager(this@TasksActivity)
            adapter = tasksAdapter
        }
    }

    private fun showContent(show: Boolean) {
        if (show) {
            setupRecyclerView(tasksList)
            Toast.makeText(this@TasksActivity, "Tâches chargées avec succès", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showEmptyState(show: Boolean) {
        if (show) {
            Toast.makeText(this@TasksActivity, "Aucune tâche trouvée", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showError(message: String) {
        Toast.makeText(this@TasksActivity, message, Toast.LENGTH_LONG).show()
    }

    override fun onResume() {
        super.onResume()
        loadTasks()
    }
}
